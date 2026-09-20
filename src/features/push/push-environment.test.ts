import { describe, expect, it } from "vitest";
import {
  readBrowserNotificationPermission,
  resolvePushEnvironmentFromWindow,
} from "./push-environment";

function createWindowStub(input: {
  userAgent: string;
  standalone?: boolean;
  hasNotification?: boolean;
  hasServiceWorker?: boolean;
  hasPushManager?: boolean;
  permission?: NotificationPermission;
}): Window {
  const notification =
    input.hasNotification === false
      ? undefined
      : {
          permission: input.permission ?? "default",
        };

  const windowStub: Record<string, unknown> = {
    navigator: {
      userAgent: input.userAgent,
      standalone: input.standalone,
      serviceWorker: input.hasServiceWorker === false ? undefined : {},
    },
    Notification: notification,
    matchMedia: () => ({ matches: Boolean(input.standalone) }),
  };

  if (input.hasPushManager !== false) {
    windowStub.PushManager = function PushManager() {};
  }

  return windowStub as unknown as Window;
}

describe("resolvePushEnvironmentFromWindow", () => {
  it("returns unsupported when PushManager is unavailable", () => {
    expect(
      resolvePushEnvironmentFromWindow(
        createWindowStub({
          userAgent: "Mozilla/5.0",
          hasPushManager: false,
        }),
      ),
    ).toBe("unsupported");
  });

  it("requires Home Screen install for iPhone Safari tabs", () => {
    expect(
      resolvePushEnvironmentFromWindow(
        createWindowStub({
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          standalone: false,
        }),
      ),
    ).toBe("requiresInstall");
  });

  it("supports installed iPhone PWA environments", () => {
    expect(
      resolvePushEnvironmentFromWindow(
        createWindowStub({
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          standalone: true,
        }),
      ),
    ).toBe("supported");
  });
});

describe("readBrowserNotificationPermission", () => {
  it("maps granted permission", () => {
    expect(
      readBrowserNotificationPermission(
        createWindowStub({ userAgent: "Mozilla/5.0", permission: "granted" }),
      ),
    ).toBe("granted");
  });
});
