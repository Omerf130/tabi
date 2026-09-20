import {
  PUSH_NOTIFICATION_BODY_MAX_LENGTH,
  PUSH_NOTIFICATION_DEFAULT_BODY,
  PUSH_NOTIFICATION_DEFAULT_TITLE,
  PUSH_NOTIFICATION_FALLBACK_URL,
  PUSH_NOTIFICATION_TAG_MAX_LENGTH,
  PUSH_NOTIFICATION_TITLE_MAX_LENGTH,
  type PushNotificationPayload,
  type PushNotificationWirePayload,
} from "./push-notification-constants";
import { sanitizePushNotificationInternalUrl } from "./sanitize-push-notification-url";

function boundedOptionalString(
  value: unknown,
  maxLength: number,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function readWirePayload(data: PushMessageData): unknown | null {
  try {
    return data.json();
  } catch {
    try {
      const text = data.text();
      if (!text.trim()) {
        return null;
      }
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  }
}

/**
 * Malformed / missing payload policy: generic Tabi copy + /app target.
 * Never throws.
 */
export function parsePushNotificationPayload(
  data: PushMessageData | null | undefined,
): PushNotificationPayload {
  const fallback: PushNotificationPayload = {
    title: PUSH_NOTIFICATION_DEFAULT_TITLE,
    body: PUSH_NOTIFICATION_DEFAULT_BODY,
    url: PUSH_NOTIFICATION_FALLBACK_URL,
  };

  if (!data) {
    return fallback;
  }

  let raw: unknown;
  try {
    raw = readWirePayload(data);
  } catch {
    return fallback;
  }

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return fallback;
  }

  const wire = raw as PushNotificationWirePayload;

  const title =
    boundedOptionalString(wire.title, PUSH_NOTIFICATION_TITLE_MAX_LENGTH) ??
    PUSH_NOTIFICATION_DEFAULT_TITLE;
  const body =
    boundedOptionalString(wire.body, PUSH_NOTIFICATION_BODY_MAX_LENGTH) ??
    PUSH_NOTIFICATION_DEFAULT_BODY;
  const url = sanitizePushNotificationInternalUrl(wire.url);
  const tag = boundedOptionalString(wire.tag, PUSH_NOTIFICATION_TAG_MAX_LENGTH);

  return {
    title,
    body,
    url,
    ...(tag ? { tag } : {}),
  };
}
