import { timingSafeEqual } from "node:crypto";

const BEARER_PATTERN = /^Bearer\s+(\S+)\s*$/i;

function readConfiguredSchedulerSecret(): string | undefined {
  const value = process.env.PUSH_SCHEDULER_SECRET?.trim();
  return value || undefined;
}

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const match = BEARER_PATTERN.exec(authorizationHeader.trim());
  return match?.[1] ?? null;
}

export function timingSafeEqualUtf8(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(provided, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

/** Returns true only when PUSH_SCHEDULER_SECRET is set and Bearer token matches. */
export function isPushSchedulerAuthorized(authorizationHeader: string | null): boolean {
  const configuredSecret = readConfiguredSchedulerSecret();
  if (!configuredSecret) {
    return false;
  }

  const provided = extractBearerToken(authorizationHeader);
  if (!provided) {
    return false;
  }

  return timingSafeEqualUtf8(configuredSecret, provided);
}
