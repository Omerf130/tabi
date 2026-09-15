import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

function getSigningSecret(): string {
  const secret = process.env.TABI_PREVIEW_TOKEN_SECRET?.trim();
  if (!secret) {
    throw new Error("TABI_PREVIEW_TOKEN_SECRET is not configured");
  }
  return secret;
}

function signPayload(payloadBase64Url: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(payloadBase64Url)
    .digest("base64url");
}

export function createSignedPayloadToken(payload: Record<string, unknown>): string {
  const payloadBase64Url = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = signPayload(payloadBase64Url);
  return `${payloadBase64Url}.${signature}`;
}

export function verifySignedPayloadToken<T extends Record<string, unknown>>(
  token: string,
): T | null {
  const [payloadBase64Url, signature] = token.split(".");
  if (!payloadBase64Url || !signature) {
    return null;
  }

  const expected = signPayload(payloadBase64Url);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadBase64Url, "base64url").toString("utf8"),
    ) as T;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
