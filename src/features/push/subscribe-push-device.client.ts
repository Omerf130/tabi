"use client";

import { PUSH_SW_SCOPE } from "./constants";
import { serializePushSubscription } from "./serialize-push-subscription";
import {
  readClientVapidPublicKey,
  toApplicationServerKey,
  InvalidVapidPublicKeyError,
} from "./vapid-public-key";

export class PushSubscribeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PushSubscribeConfigError";
  }
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new PushSubscribeConfigError("service worker unavailable");
  }

  const existing = await navigator.serviceWorker.getRegistration(PUSH_SW_SCOPE);
  if (existing) {
    return existing;
  }

  throw new PushSubscribeConfigError("service worker not registered");
}

export async function getBrowserPushSubscription(): Promise<PushSubscription | null> {
  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.getSubscription();
}

export async function ensureBrowserPushSubscription(): Promise<PushSubscription> {
  const publicKey = readClientVapidPublicKey();
  if (!publicKey) {
    throw new PushSubscribeConfigError("VAPID public key is not configured");
  }

  let applicationServerKey: Uint8Array;
  try {
    applicationServerKey = toApplicationServerKey(publicKey);
  } catch (error) {
    if (error instanceof InvalidVapidPublicKeyError) {
      throw new PushSubscribeConfigError(error.message);
    }
    throw error;
  }

  const registration = await getServiceWorkerRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as BufferSource,
  });
}

export async function requestNotificationPermissionFromUserGesture(): Promise<
  NotificationPermission
> {
  if (!("Notification" in window)) {
    throw new PushSubscribeConfigError("notifications unavailable");
  }

  return Notification.requestPermission();
}

export async function unsubscribeBrowserPushSubscription(): Promise<boolean> {
  const subscription = await getBrowserPushSubscription();
  if (!subscription) {
    return false;
  }

  return subscription.unsubscribe();
}

export async function readSerializedBrowserPushSubscription(): Promise<
  ReturnType<typeof serializePushSubscription>
> {
  const subscription = await getBrowserPushSubscription();
  if (!subscription) {
    return null;
  }

  return serializePushSubscription(subscription);
}
