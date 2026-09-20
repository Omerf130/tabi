export type SerializedPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function serializePushSubscription(
  subscription: PushSubscription,
): SerializedPushSubscription | null {
  const endpoint = subscription.endpoint?.trim();
  const p256dhKey = subscription.getKey("p256dh");
  const authKey = subscription.getKey("auth");

  if (!endpoint || !p256dhKey || !authKey) {
    return null;
  }

  return {
    endpoint,
    keys: {
      p256dh: arrayBufferToBase64Url(p256dhKey),
      auth: arrayBufferToBase64Url(authKey),
    },
  };
}
