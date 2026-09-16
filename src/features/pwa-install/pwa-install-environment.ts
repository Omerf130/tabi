import type {
  BeforeInstallPromptEvent,
  InstallInteraction,
  PwaInstallAvailability,
} from "./pwa-install-types";

export function isIosDeviceUserAgent(userAgent: string): boolean {
  return /iPad|iPhone|iPod/.test(userAgent);
}

export function isIosSafariInstallCandidate(userAgent: string): boolean {
  if (!isIosDeviceUserAgent(userAgent)) {
    return false;
  }

  if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent)) {
    return false;
  }

  return true;
}

export function isStandalonePwa(signals: {
  displayModeStandalone: boolean;
  navigatorStandalone?: boolean;
}): boolean {
  return signals.displayModeStandalone || signals.navigatorStandalone === true;
}

export function readStandaloneSignals(windowLike: Window): boolean {
  const displayModeStandalone = windowLike.matchMedia(
    "(display-mode: standalone)",
  ).matches;
  const navigatorStandalone = (
    windowLike.navigator as Navigator & { standalone?: boolean }
  ).standalone;

  return isStandalonePwa({
    displayModeStandalone,
    navigatorStandalone,
  });
}

export function shouldShowPwaInstallCta(
  availability: PwaInstallAvailability,
): boolean {
  if (availability.isStandalone) {
    return false;
  }

  return availability.hasDeferredPrompt || availability.iosInstallEligible;
}

export function resolveInstallInteraction(input: {
  hasDeferredPrompt: boolean;
  iosInstallEligible: boolean;
}): InstallInteraction {
  if (input.hasDeferredPrompt) {
    return "native";
  }

  if (input.iosInstallEligible) {
    return "ios-instructions";
  }

  return "none";
}

export async function runDeferredInstallPrompt(
  event: Pick<BeforeInstallPromptEvent, "prompt" | "userChoice">,
): Promise<"accepted" | "dismissed"> {
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome;
}

export function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return (
    "prompt" in event &&
    typeof (event as BeforeInstallPromptEvent).prompt === "function" &&
    "userChoice" in event
  );
}
