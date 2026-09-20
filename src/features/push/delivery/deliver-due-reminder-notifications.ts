import "server-only";

import type { AppLocale } from "@/features/i18n/locale";
import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";
import { listRemindersDueForNotification } from "@/features/trips/reminders/select-reminders-due-for-notification";
import {
  deletePushSubscriptionByEndpoint,
  listPushSubscriptionsForUser,
} from "../push-subscription-domain";
import { buildTripReminderPushWirePayload } from "./build-trip-reminder-push-payload";
import { REMINDER_NOTIFICATION_DELIVERY_BATCH_SIZE } from "./constants";
import { localizeTripReminderPushBody } from "./localize-trip-reminder-push-body";
import {
  claimReminderNotification,
  markReminderNotificationSent,
  releaseReminderNotificationClaim,
  type ClaimedReminderNotification,
} from "./reminder-notification-claim";
import {
  getVapidServerConfig,
  VapidConfigurationError,
} from "./vapid-server-config";
import { sendWebPushNotification } from "./web-push-sender";
import { validateClaimedReminderBeforeSend } from "./validate-reminder-before-send";

export type ReminderNotificationDeliverySummary = {
  discovered: number;
  claimed: number;
  sent: number;
  skipped: number;
  failed: number;
  expiredSubscriptionsRemoved: number;
};

export { VapidConfigurationError };

function createEmptySummary(): ReminderNotificationDeliverySummary {
  return {
    discovered: 0,
    claimed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    expiredSubscriptionsRemoved: 0,
  };
}

async function resolveUserLocale(userId: string): Promise<AppLocale> {
  await connectDb();
  const user = await User.findById(userId).select("locale").lean();
  if (user?.locale === "en" || user?.locale === "he") {
    return user.locale;
  }
  return "he";
}

async function sendToUserSubscriptions(input: {
  userId: string;
  tripId: string;
  reminderId: string;
  locale: AppLocale;
}): Promise<{
  anySuccess: boolean;
  allFailed: boolean;
  expiredEndpoints: string[];
  hadSubscriptions: boolean;
}> {
  const subscriptions = await listPushSubscriptionsForUser(input.userId);
  if (subscriptions.length === 0) {
    return {
      anySuccess: false,
      allFailed: false,
      expiredEndpoints: [],
      hadSubscriptions: false,
    };
  }

  const payload = buildTripReminderPushWirePayload({
    tripId: input.tripId,
    reminderId: input.reminderId,
    body: localizeTripReminderPushBody(input.locale),
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => ({
      endpoint: subscription.endpoint,
      result: await sendWebPushNotification(subscription, payload),
    })),
  );

  let anySuccess = false;
  let failureCount = 0;
  const expiredEndpoints: string[] = [];

  for (const settled of results) {
    if (settled.status === "rejected") {
      failureCount += 1;
      continue;
    }

    const { endpoint, result } = settled.value;
    if (result.status === "success") {
      anySuccess = true;
      continue;
    }

    if (result.status === "expired_subscription") {
      expiredEndpoints.push(endpoint);
      failureCount += 1;
      continue;
    }

    failureCount += 1;
  }

  const allFailed = !anySuccess && failureCount === subscriptions.length;
  return {
    anySuccess,
    allFailed,
    expiredEndpoints,
    hadSubscriptions: true,
  };
}

export async function processClaimedReminderNotification(
  claimed: ClaimedReminderNotification,
  now: Date,
): Promise<{
  outcome: "sent" | "skipped" | "failed" | "deferred";
  expiredSubscriptionsRemoved: number;
}> {
  const validation = await validateClaimedReminderBeforeSend(claimed);
  if (!validation.ok) {
    await releaseReminderNotificationClaim(claimed.id);
    return { outcome: "skipped", expiredSubscriptionsRemoved: 0 };
  }

  const locale = await resolveUserLocale(claimed.userId);
  const sendResult = await sendToUserSubscriptions({
    userId: claimed.userId,
    tripId: claimed.tripId,
    reminderId: claimed.id,
    locale,
  });

  for (const endpoint of sendResult.expiredEndpoints) {
    await deletePushSubscriptionByEndpoint(endpoint);
  }

  if (sendResult.anySuccess) {
    await markReminderNotificationSent({
      reminderId: claimed.id,
      claimedScheduledAtUtc: claimed.scheduledAtUtc,
      sentAt: now,
    });
    return {
      outcome: "sent",
      expiredSubscriptionsRemoved: sendResult.expiredEndpoints.length,
    };
  }

  if (!sendResult.hadSubscriptions) {
    return {
      outcome: "deferred",
      expiredSubscriptionsRemoved: sendResult.expiredEndpoints.length,
    };
  }

  if (sendResult.allFailed) {
    await releaseReminderNotificationClaim(claimed.id);
    return {
      outcome: "failed",
      expiredSubscriptionsRemoved: sendResult.expiredEndpoints.length,
    };
  }

  await releaseReminderNotificationClaim(claimed.id);
  return {
    outcome: "failed",
    expiredSubscriptionsRemoved: sendResult.expiredEndpoints.length,
  };
}

export async function deliverDueReminderNotifications(input?: {
  now?: Date;
  batchSize?: number;
}): Promise<ReminderNotificationDeliverySummary> {
  getVapidServerConfig();

  const now = input?.now ?? new Date();
  const batchSize = input?.batchSize ?? REMINDER_NOTIFICATION_DELIVERY_BATCH_SIZE;
  const summary = createEmptySummary();

  const candidates = await listRemindersDueForNotification(now, batchSize);
  summary.discovered = candidates.length;

  for (const candidate of candidates) {
    const claimed = await claimReminderNotification(candidate.id, now);
    if (!claimed) {
      continue;
    }

    summary.claimed += 1;
    const result = await processClaimedReminderNotification(claimed, now);
    summary.expiredSubscriptionsRemoved += result.expiredSubscriptionsRemoved;

    if (result.outcome === "sent") {
      summary.sent += 1;
    } else if (result.outcome === "failed") {
      summary.failed += 1;
    } else {
      summary.skipped += 1;
    }
  }

  return summary;
}
