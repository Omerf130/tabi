import { describe, expect, it, vi } from "vitest";
import {
  isIosSafariInstallCandidate,
  isStandalonePwa,
  resolveInstallInteraction,
  runDeferredInstallPrompt,
  shouldShowPwaInstallCta,
} from "./pwa-install-environment";

describe("shouldShowPwaInstallCta", () => {
  it("hides the CTA in standalone mode", () => {
    expect(
      shouldShowPwaInstallCta({
        isStandalone: true,
        hasDeferredPrompt: true,
        iosInstallEligible: true,
      }),
    ).toBe(false);
  });

  it("shows the CTA when a native install prompt is available", () => {
    expect(
      shouldShowPwaInstallCta({
        isStandalone: false,
        hasDeferredPrompt: true,
        iosInstallEligible: false,
      }),
    ).toBe(true);
  });

  it("shows the CTA on iOS Safari install flow", () => {
    expect(
      shouldShowPwaInstallCta({
        isStandalone: false,
        hasDeferredPrompt: false,
        iosInstallEligible: true,
      }),
    ).toBe(true);
  });

  it("hides the CTA in unsupported environments", () => {
    expect(
      shouldShowPwaInstallCta({
        isStandalone: false,
        hasDeferredPrompt: false,
        iosInstallEligible: false,
      }),
    ).toBe(false);
  });
});

describe("resolveInstallInteraction", () => {
  it("prefers the native install prompt when available", () => {
    expect(
      resolveInstallInteraction({
        hasDeferredPrompt: true,
        iosInstallEligible: true,
      }),
    ).toBe("native");
  });

  it("opens iOS instructions when no native prompt exists", () => {
    expect(
      resolveInstallInteraction({
        hasDeferredPrompt: false,
        iosInstallEligible: true,
      }),
    ).toBe("ios-instructions");
  });

  it("returns none when installation is unavailable", () => {
    expect(
      resolveInstallInteraction({
        hasDeferredPrompt: false,
        iosInstallEligible: false,
      }),
    ).toBe("none");
  });
});

describe("isIosSafariInstallCandidate", () => {
  it("detects iPhone Safari", () => {
    expect(
      isIosSafariInstallCandidate(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(true);
  });

  it("excludes Chrome on iOS", () => {
    expect(
      isIosSafariInstallCandidate(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
  });

  it("returns false for desktop Chrome", () => {
    expect(
      isIosSafariInstallCandidate(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
  });
});

describe("isStandalonePwa", () => {
  it("detects display-mode standalone", () => {
    expect(
      isStandalonePwa({ displayModeStandalone: true, navigatorStandalone: false }),
    ).toBe(true);
  });

  it("detects iOS navigator.standalone", () => {
    expect(
      isStandalonePwa({ displayModeStandalone: false, navigatorStandalone: true }),
    ).toBe(true);
  });
});

describe("runDeferredInstallPrompt", () => {
  it("invokes the browser prompt and returns the user choice", async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({
      outcome: "accepted" as const,
      platform: "web",
    });

    await expect(
      runDeferredInstallPrompt({ prompt, userChoice }),
    ).resolves.toBe("accepted");
    expect(prompt).toHaveBeenCalledOnce();
  });
});
