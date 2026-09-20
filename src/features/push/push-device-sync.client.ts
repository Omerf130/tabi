"use client";

import {
  subscribePushSubscriptionAction,
  unsubscribePushSubscriptionAction,
} from "./actions";
import type { PushSubscriptionErrorCode } from "./constants";
import { serializePushSubscription } from "./serialize-push-subscription";
import {
  ensureBrowserPushSubscription,
  getBrowserPushSubscription,
  readSerializedBrowserPushSubscription,
  requestNotificationPermissionFromUserGesture,
  unsubscribeBrowserPushSubscription,
} from "./subscribe-push-device.client";

function toFormData(serialized: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): FormData {
  const formData = new FormData();
  formData.set("endpoint", serialized.endpoint);
  formData.set("p256dh", serialized.keys.p256dh);
  formData.set("auth", serialized.keys.auth);
  return formData;
}

export async function enablePushNotificationsOnDevice(): Promise<{
  ok: boolean;
  permission: NotificationPermission | "unsupported";
  errorCode?: PushSubscriptionErrorCode;
}> {
  const permission = await requestNotificationPermissionFromUserGesture();
  if (permission !== "granted") {
    return { ok: false, permission };
  }

  const subscription = await ensureBrowserPushSubscription();
  const serialized = serializePushSubscription(subscription);
  if (!serialized) {
    return { ok: false, permission };
  }

  const result = await subscribePushSubscriptionAction({}, toFormData(serialized));
  return {
    ok: Boolean(result.ok),
    permission,
    errorCode: result.errorCode,
  };
}

export async function disablePushNotificationsOnDevice(): Promise<void> {
  const serialized = await readSerializedBrowserPushSubscription();

  if (serialized) {
    const formData = new FormData();
    formData.set("endpoint", serialized.endpoint);
    await unsubscribePushSubscriptionAction({}, formData);
  }

  await unsubscribeBrowserPushSubscription();
}

export async function bestEffortDisablePushOnLogout(): Promise<void> {
  try {
    await disablePushNotificationsOnDevice();
  } catch {
    // Logout must proceed even if push cleanup fails.
  }
}

export async function syncExistingBrowserSubscriptionToServer(): Promise<boolean> {
  const serialized = await readSerializedBrowserPushSubscription();
  if (!serialized) {
    return false;
  }

  const result = await subscribePushSubscriptionAction({}, toFormData(serialized));
  return Boolean(result.ok);
}

export async function hasActiveBrowserPushSubscription(): Promise<boolean> {
  const subscription = await getBrowserPushSubscription();
  return subscription !== null;
}
