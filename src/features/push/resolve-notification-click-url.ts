import { PUSH_NOTIFICATION_FALLBACK_URL } from "./push-notification-constants";
import { sanitizePushNotificationInternalUrl } from "./sanitize-push-notification-url";

export function resolveNotificationClickUrl(data: unknown): string {
  if (!data || typeof data !== "object") {
    return PUSH_NOTIFICATION_FALLBACK_URL;
  }

  const url = (data as { url?: unknown }).url;
  return sanitizePushNotificationInternalUrl(url);
}
