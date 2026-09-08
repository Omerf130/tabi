const INVITE_TOKEN_PATTERN = /^\/invite\/[A-Za-z0-9_-]{20,}$/;
const APP_TRIP_PATH_PATTERN = /^\/app\/trips\/[a-f0-9]{24}(\/[A-Za-z0-9_-]+)?$/;

const ALLOWED_RETURN_TO = [INVITE_TOKEN_PATTERN, APP_TRIP_PATH_PATTERN];

function decodeReturnTo(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value && decoded.includes("%")) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function sanitizeReturnTo(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  if (trimmed.includes("\\") || trimmed.includes("\0")) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return null;
  }

  const normalized = decodeReturnTo(trimmed);
  if (!normalized) {
    return null;
  }

  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return null;
  }

  if (normalized.includes("\\") || normalized.includes("\0")) {
    return null;
  }

  return ALLOWED_RETURN_TO.some((pattern) => pattern.test(normalized))
    ? normalized
    : null;
}

export function buildAuthHref(
  path: "/login" | "/register",
  returnTo: string,
): string {
  return `${path}?next=${encodeURIComponent(returnTo)}`;
}
