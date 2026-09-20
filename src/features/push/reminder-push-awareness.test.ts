import { describe, expect, it } from "vitest";
import {
  getReminderPushAwarenessVariant,
  shouldShowReminderPushAwarenessCallout,
} from "./reminder-push-awareness";
import type { PushDeviceUiState } from "./use-push-notifications.client";

describe("reminder push awareness", () => {
  it("hides for subscribed and loading", () => {
    expect(shouldShowReminderPushAwarenessCallout("subscribed")).toBe(false);
    expect(shouldShowReminderPushAwarenessCallout("loading")).toBe(false);
    expect(shouldShowReminderPushAwarenessCallout("error")).toBe(false);
  });

  it("maps actionable states to variants", () => {
    expect(getReminderPushAwarenessVariant("permissionDefault")).toBe("enable");
    expect(getReminderPushAwarenessVariant("notSubscribed")).toBe("enable");
    expect(getReminderPushAwarenessVariant("permissionDenied")).toBe("settings");
    expect(getReminderPushAwarenessVariant("requiresInstall")).toBe("install");
    expect(getReminderPushAwarenessVariant("unsupported")).toBe("unsupported");
  });

  it("never blocks reminder flows by design", () => {
    const states: PushDeviceUiState[] = [
      "permissionDefault",
      "permissionDenied",
      "unsupported",
      "requiresInstall",
      "notSubscribed",
      "error",
      "subscribed",
      "loading",
    ];

    for (const state of states) {
      expect(typeof shouldShowReminderPushAwarenessCallout(state)).toBe("boolean");
    }
  });
});
