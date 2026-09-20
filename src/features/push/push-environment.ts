import {
  isIosSafariInstallCandidate,
  readStandaloneSignals,
} from "@/features/pwa-install/pwa-install-environment";

export type PushEnvironmentKind =
  | "supported"
  | "unsupported"
  | "requiresInstall";

export type BrowserNotificationPermission =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export function resolvePushEnvironmentFromWindow(windowLike: Window): PushEnvironmentKind {
  const hasNotification = "Notification" in windowLike;
  const hasServiceWorker = "serviceWorker" in windowLike.navigator;
  const hasPushManager = hasServiceWorker && "PushManager" in windowLike;

  if (!hasNotification || !hasServiceWorker || !hasPushManager) {
    return "unsupported";
  }

  const isIosSafari = isIosSafariInstallCandidate(windowLike.navigator.userAgent);
  const isStandalone = readStandaloneSignals(windowLike);

  if (isIosSafari && !isStandalone) {
    return "requiresInstall";
  }

  return "supported";
}

export function readBrowserNotificationPermission(
  windowLike: Window,
): BrowserNotificationPermission {
  if (!("Notification" in windowLike)) {
    return "unsupported";
  }

  const notificationApi = (
    windowLike as Window & {
      Notification?: { permission: NotificationPermission };
    }
  ).Notification;

  if (!notificationApi) {
    return "unsupported";
  }

  const permission = notificationApi.permission;
  if (permission === "default" || permission === "granted" || permission === "denied") {
    return permission;
  }

  return "unsupported";
}
