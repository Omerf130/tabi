import "server-only";

import webpush from "web-push";
import type { PushSubscriptionUpsertInput } from "../push-subscription-domain";
import type { PushNotificationWirePayload } from "../push-notification-constants";
import { getVapidServerConfig } from "./vapid-server-config";

export type PushSendResult =
  | { status: "success" }
  | { status: "expired_subscription"; statusCode?: number }
  | { status: "temporary_failure"; statusCode?: number }
  | { status: "permanent_failure"; statusCode?: number };

let vapidConfigured = false;

function ensureVapidConfigured(): void {
  if (vapidConfigured) {
    return;
  }
  const config = getVapidServerConfig();
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  vapidConfigured = true;
}

function toWebPushSubscription(
  subscription: PushSubscriptionUpsertInput,
): import("web-push").PushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };
}

function classifyWebPushError(error: unknown): PushSendResult {
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode: unknown }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : undefined;

  if (statusCode === 404 || statusCode === 410) {
    return { status: "expired_subscription", statusCode };
  }

  if (statusCode === 429 || (statusCode !== undefined && statusCode >= 500)) {
    return { status: "temporary_failure", statusCode };
  }

  if (statusCode !== undefined && statusCode >= 400) {
    return { status: "permanent_failure", statusCode };
  }

  return { status: "temporary_failure", statusCode };
}

export async function sendWebPushNotification(
  subscription: PushSubscriptionUpsertInput,
  payload: PushNotificationWirePayload,
): Promise<PushSendResult> {
  ensureVapidConfigured();
  const body = JSON.stringify(payload);

  try {
    await webpush.sendNotification(toWebPushSubscription(subscription), body);
    return { status: "success" };
  } catch (error) {
    return classifyWebPushError(error);
  }
}

/** Test hook to reset module-level VAPID configuration. */
export function resetWebPushVapidConfigurationForTests(): void {
  vapidConfigured = false;
}
