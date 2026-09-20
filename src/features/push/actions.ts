"use server";

import { requireUser } from "@/features/auth/session";
import {
  PUSH_SUBSCRIPTION_ERROR_CODES,
  type PushSubscriptionErrorCode,
} from "./constants";
import {
  deletePushSubscriptionForUserEndpoint,
  upsertPushSubscriptionForUser,
} from "./push-subscription-domain";
import {
  pushSubscriptionEndpointSchema,
  pushSubscriptionInputSchema,
} from "./schemas";

export type PushSubscriptionActionState = {
  ok?: boolean;
  errorCode?: PushSubscriptionErrorCode;
};

export async function subscribePushSubscriptionAction(
  _prev: PushSubscriptionActionState,
  formData: FormData,
): Promise<PushSubscriptionActionState> {
  const parsed = pushSubscriptionInputSchema.safeParse({
    endpoint: formData.get("endpoint"),
    keys: {
      p256dh: formData.get("p256dh"),
      auth: formData.get("auth"),
    },
  });

  if (!parsed.success) {
    return { errorCode: PUSH_SUBSCRIPTION_ERROR_CODES.invalidInput };
  }

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()) {
    return { errorCode: PUSH_SUBSCRIPTION_ERROR_CODES.vapidNotConfigured };
  }

  try {
    const user = await requireUser();
    await upsertPushSubscriptionForUser(user.id, parsed.data);
    return { ok: true };
  } catch {
    return { errorCode: PUSH_SUBSCRIPTION_ERROR_CODES.generic };
  }
}

export async function unsubscribePushSubscriptionAction(
  _prev: PushSubscriptionActionState,
  formData: FormData,
): Promise<PushSubscriptionActionState> {
  const parsed = pushSubscriptionEndpointSchema.safeParse({
    endpoint: formData.get("endpoint"),
  });

  if (!parsed.success) {
    return { errorCode: PUSH_SUBSCRIPTION_ERROR_CODES.invalidInput };
  }

  try {
    const user = await requireUser();
    const deleted = await deletePushSubscriptionForUserEndpoint(
      user.id,
      parsed.data.endpoint,
    );
    if (!deleted) {
      return { errorCode: PUSH_SUBSCRIPTION_ERROR_CODES.forbidden };
    }
    return { ok: true };
  } catch {
    return { errorCode: PUSH_SUBSCRIPTION_ERROR_CODES.generic };
  }
}
