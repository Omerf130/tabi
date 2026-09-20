import {
  PUSH_NOTIFICATION_FALLBACK_URL,
  PUSH_NOTIFICATION_URL_MAX_LENGTH,
} from "./push-notification-constants";

function decodePathOnce(value: string): string | null {
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

/** Accepts only same-origin-relative Tabi app paths (no external navigation). */
export function sanitizePushNotificationInternalUrl(raw: unknown): string {
  if (typeof raw !== "string") {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  if (trimmed.includes("\\") || trimmed.includes("\0")) {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  const normalized = decodePathOnce(trimmed);
  if (
    !normalized ||
    !normalized.startsWith("/") ||
    normalized.startsWith("//")
  ) {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  if (normalized.includes("..")) {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  if (!normalized.startsWith("/app")) {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  if (normalized.length > PUSH_NOTIFICATION_URL_MAX_LENGTH) {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  return normalized;
}
