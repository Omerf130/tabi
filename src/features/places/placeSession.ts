const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPlaceSessionToken(value: string): boolean {
  return UUID_V4_PATTERN.test(value);
}

function getCrypto(): Crypto | undefined {
  if (typeof globalThis.crypto !== "undefined") {
    return globalThis.crypto;
  }
  return undefined;
}

export function createPlaceSessionToken(): string {
  const cryptoObject = getCrypto();
  if (cryptoObject?.randomUUID) {
    return cryptoObject.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (cryptoObject?.getRandomValues) {
    cryptoObject.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function isValidGooglePlaceId(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 10 && trimmed.length <= 512 && /^[\w-]+$/.test(trimmed);
}
