import type { PushDeviceUiState } from "./use-push-notifications.client";

export type ReminderPushAwarenessVariant =
  | "enable"
  | "settings"
  | "install"
  | "unsupported";

export function getReminderPushAwarenessVariant(
  uiState: PushDeviceUiState,
): ReminderPushAwarenessVariant | null {
  switch (uiState) {
    case "permissionDefault":
    case "notSubscribed":
      return "enable";
    case "permissionDenied":
      return "settings";
    case "requiresInstall":
      return "install";
    case "unsupported":
      return "unsupported";
    default:
      return null;
  }
}

export function shouldShowReminderPushAwarenessCallout(
  uiState: PushDeviceUiState,
): boolean {
  return getReminderPushAwarenessVariant(uiState) !== null;
}
