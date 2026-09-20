import { openOrFocusTabiAtPath } from "./open-or-focus-tabi-at-path";
import { parsePushNotificationPayload } from "./parse-push-notification-payload";
import {
  PUSH_NOTIFICATION_DEFAULT_BODY,
  PUSH_NOTIFICATION_DEFAULT_TITLE,
  PUSH_NOTIFICATION_FALLBACK_URL,
  PUSH_NOTIFICATION_ICON_PATH,
} from "./push-notification-constants";
import { resolveNotificationClickUrl } from "./resolve-notification-click-url";

async function showGenericFallbackNotification(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  await registration.showNotification(PUSH_NOTIFICATION_DEFAULT_TITLE, {
    body: PUSH_NOTIFICATION_DEFAULT_BODY,
    icon: PUSH_NOTIFICATION_ICON_PATH,
    data: { url: PUSH_NOTIFICATION_FALLBACK_URL },
  });
}

/** Push receive/display + notification click (N2). No fetch, cache, or private data. */
export function registerTabiPushNotificationListeners(
  scope: ServiceWorkerGlobalScope,
): void {
  scope.addEventListener("push", (event) => {
    event.waitUntil(
      (async () => {
        try {
          const payload = parsePushNotificationPayload(event.data ?? null);
          await scope.registration.showNotification(payload.title, {
            body: payload.body,
            icon: PUSH_NOTIFICATION_ICON_PATH,
            data: { url: payload.url },
            ...(payload.tag ? { tag: payload.tag } : {}),
          });
        } catch {
          try {
            await showGenericFallbackNotification(scope.registration);
          } catch {
            // Deterministic policy: never throw from push handler.
          }
        }
      })(),
    );
  });

  scope.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const targetPath = resolveNotificationClickUrl(event.notification.data);
    event.waitUntil(openOrFocusTabiAtPath(scope, targetPath));
  });
}
