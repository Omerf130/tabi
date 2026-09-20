const BASE64_URL_SAFE_PATTERN = /^[A-Za-z0-9_-]+$/;

export class InvalidVapidPublicKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVapidPublicKeyError";
  }
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const trimmed = base64String.trim();
  if (!trimmed || !BASE64_URL_SAFE_PATTERN.test(trimmed)) {
    throw new InvalidVapidPublicKeyError("invalid VAPID public key format");
  }

  const padding = "=".repeat((4 - (trimmed.length % 4)) % 4);
  const base64 = (trimmed + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}

export function readClientVapidPublicKey(): string | null {
  const value = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return value || null;
}

export function toApplicationServerKey(publicKey: string): Uint8Array {
  return urlBase64ToUint8Array(publicKey);
}
