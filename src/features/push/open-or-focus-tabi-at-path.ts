import { sanitizePushNotificationInternalUrl } from "./sanitize-push-notification-url";

type PushWindowClient = WindowClient & {
  focus(): Promise<WindowClient>;
  navigate?(url: string): Promise<WindowClient>;
};

type PushClientsScope = Pick<
  ServiceWorkerGlobalScope,
  "clients" | "location"
>;

/** V1: focus any same-origin Tabi window and navigate; otherwise open one. */
export async function openOrFocusTabiAtPath(
  scope: PushClientsScope,
  path: string,
): Promise<void> {
  const safePath = sanitizePushNotificationInternalUrl(path);
  const absoluteUrl = new URL(safePath, scope.location.origin).href;

  const windowClients = await scope.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windowClients) {
    try {
      const clientOrigin = new URL(client.url).origin;
      if (clientOrigin !== scope.location.origin) {
        continue;
      }

      const windowClient = client as PushWindowClient;
      if (typeof windowClient.focus === "function") {
        await windowClient.focus();
      }

      if (typeof windowClient.navigate === "function") {
        await windowClient.navigate(safePath);
      }

      return;
    } catch {
      continue;
    }
  }

  await scope.clients.openWindow(absoluteUrl);
}
