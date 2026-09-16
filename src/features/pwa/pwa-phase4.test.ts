import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  shouldEnableUpdateNow,
  shouldReloadAfterControlling,
  shouldShowSwUpdatePrompt,
} from "./sw-update-state";

const root = process.cwd();

describe("PWA Phase 4 sw-update-state", () => {
  it("hides the prompt without a waiting worker", () => {
    expect(
      shouldShowSwUpdatePrompt({
        hasWaitingWorker: false,
        isFirstInstallWaiting: false,
        dismissedForSession: false,
        isApplyingUpdate: false,
      }),
    ).toBe(false);
  });

  it("shows the prompt for a waiting update worker", () => {
    expect(
      shouldShowSwUpdatePrompt({
        hasWaitingWorker: true,
        isFirstInstallWaiting: false,
        dismissedForSession: false,
        isApplyingUpdate: false,
      }),
    ).toBe(true);
  });

  it("does not show for first-install waiting without a controller", () => {
    expect(
      shouldShowSwUpdatePrompt({
        hasWaitingWorker: true,
        isFirstInstallWaiting: true,
        dismissedForSession: false,
        isApplyingUpdate: false,
      }),
    ).toBe(false);
  });

  it("hides while applying or dismissed", () => {
    expect(
      shouldShowSwUpdatePrompt({
        hasWaitingWorker: true,
        isFirstInstallWaiting: false,
        dismissedForSession: true,
        isApplyingUpdate: false,
      }),
    ).toBe(false);

    expect(
      shouldShowSwUpdatePrompt({
        hasWaitingWorker: true,
        isFirstInstallWaiting: false,
        dismissedForSession: false,
        isApplyingUpdate: true,
      }),
    ).toBe(false);
  });

  it("disables Update now when offline or applying", () => {
    expect(shouldEnableUpdateNow(false, false)).toBe(false);
    expect(shouldEnableUpdateNow(true, true)).toBe(false);
    expect(shouldEnableUpdateNow(true, false)).toBe(true);
  });

  it("reloads only for user-approved non-external controlling events", () => {
    expect(
      shouldReloadAfterControlling({
        userApprovedUpdate: false,
        isExternal: false,
      }),
    ).toBe(false);

    expect(
      shouldReloadAfterControlling({
        userApprovedUpdate: true,
        isExternal: true,
      }),
    ).toBe(false);

    expect(
      shouldReloadAfterControlling({
        userApprovedUpdate: true,
        isExternal: false,
      }),
    ).toBe(true);
  });
});

describe("PWA Phase 4 update lifecycle wiring", () => {
  it("keeps skipWaiting false and sets clientsClaim true", () => {
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    expect(swSource).toContain("skipWaiting: false");
    expect(swSource).toContain("clientsClaim: true");
    expect(swSource).not.toContain("skipWaiting: true");
  });

  it("registers controlling listener before messageSkipWaiting in apply flow", () => {
    const flowSource = readFileSync(
      join(root, "src/features/pwa/sw-update-apply-flow.ts"),
      "utf8",
    );
    const addIndex = flowSource.indexOf('addEventListener("controlling"');
    const skipIndex = flowSource.indexOf("messageSkipWaiting()");
    expect(addIndex).toBeGreaterThan(-1);
    expect(skipIndex).toBeGreaterThan(addIndex);
    expect(flowSource).not.toMatch(
      /messageSkipWaiting\(\)[\s\S]*addEventListener\("controlling"/,
    );
  });

  it("sets applying ref before messageSkipWaiting", () => {
    const flowSource = readFileSync(
      join(root, "src/features/pwa/sw-update-apply-flow.ts"),
      "utf8",
    );
    const refIndex = flowSource.indexOf("isApplyingUpdateRef.current = true");
    const skipIndex = flowSource.indexOf("messageSkipWaiting()");
    expect(refIndex).toBeGreaterThan(-1);
    expect(skipIndex).toBeGreaterThan(refIndex);
  });

  it("does not reload immediately after messageSkipWaiting", () => {
    const flowSource = readFileSync(
      join(root, "src/features/pwa/sw-update-apply-flow.ts"),
      "utf8",
    );
    expect(flowSource).not.toMatch(
      /messageSkipWaiting\(\);\s*reload\(\)/,
    );
    expect(flowSource).toContain("reload()");
  });

  it("calls update on visibilitychange only", () => {
    const hookSource = readFileSync(
      join(root, "src/features/pwa/useSerwistUpdate.ts"),
      "utf8",
    );
    expect(hookSource).toContain('document.addEventListener("visibilitychange"');
    expect(hookSource).toContain("serwist.update()");
    expect(hookSource).not.toMatch(/setInterval|setTimeout\([^)]*update/);
  });

  it("does not persist Later dismissal in storage", () => {
    const hookSource = readFileSync(
      join(root, "src/features/pwa/useSerwistUpdate.ts"),
      "utf8",
    );
    const promptSource = readFileSync(
      join(root, "src/features/pwa/SwUpdatePrompt.client.tsx"),
      "utf8",
    );
    for (const source of [hookSource, promptSource]) {
      expect(source).not.toContain("localStorage");
      expect(source).not.toContain("sessionStorage");
    }
  });
});

describe("PWA Phase 4 prompt mount and copy", () => {
  it("mounts SwUpdatePrompt exactly once in root layout", () => {
    const layoutSource = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
    expect(layoutSource).toContain("<SwUpdatePrompt />");
    expect(layoutSource.match(/<SwUpdatePrompt\s*\/>/g)?.length).toBe(1);
    const providerBlock = layoutSource.slice(
      layoutSource.indexOf("<TabiSerwistProvider>"),
      layoutSource.indexOf("</TabiSerwistProvider>"),
    );
    expect(providerBlock.indexOf("<NextIntlClientProvider")).toBeGreaterThan(-1);
    expect(providerBlock.indexOf("<ConnectivityBanner")).toBeLessThan(
      providerBlock.indexOf("<SwUpdatePrompt"),
    );
  });

  it("defines Hebrew and English SwUpdate strings", () => {
    const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8")) as {
      SwUpdate: Record<string, string>;
    };
    const he = JSON.parse(readFileSync(join(root, "messages/he.json"), "utf8")) as {
      SwUpdate: Record<string, string>;
    };

    expect(en.SwUpdate.title).toBe("A new version of Tabi is available");
    expect(he.SwUpdate.title).toBe("גרסה חדשה של Tabi זמינה");
    expect(en.SwUpdate.primary).toBe("Update now");
    expect(he.SwUpdate.secondary).toBe("אחר כך");
  });

  it("uses a bottom card rather than modal or top banner", () => {
    const styles = readFileSync(
      join(root, "src/features/pwa/SwUpdatePrompt.module.scss"),
      "utf8",
    );
    const promptSource = readFileSync(
      join(root, "src/features/pwa/SwUpdatePrompt.client.tsx"),
      "utf8",
    );
    expect(styles).toContain("bottom:");
    expect(styles).not.toContain("top:");
    expect(promptSource).not.toContain("<dialog");
    expect(promptSource).not.toContain("HTMLDialogElement");
  });
});

describe("PWA Phase 4 applyUpdate behavior", () => {
  it("calls messageSkipWaiting once and reloads only from controlling handler", async () => {
    const reload = vi.fn();
    const serwist = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      messageSkipWaiting: vi.fn(),
    };

    let controllingHandler: ((event: { isExternal?: boolean }) => void) | undefined;
    serwist.addEventListener.mockImplementation(
      (type: string, handler: (event: { isExternal?: boolean }) => void) => {
        if (type === "controlling") {
          controllingHandler = handler;
        }
      },
    );

    const registration = {
      waiting: {},
    } as ServiceWorkerRegistration;

    const { applySwUpdate } = await import("./sw-update-apply-flow");

    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    const offline = await applySwUpdate({
      serwist: serwist as never,
      isApplyingUpdateRef: { current: false },
      getRegistration: async () => registration,
      reload,
    });
    expect(offline).toBe(false);
    expect(serwist.messageSkipWaiting).not.toHaveBeenCalled();

    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    const isApplyingUpdateRef = { current: false };
    const started = await applySwUpdate({
      serwist: serwist as never,
      isApplyingUpdateRef,
      getRegistration: async () => registration,
      reload,
    });

    expect(started).toBe(true);
    expect(serwist.addEventListener).toHaveBeenCalledWith(
      "controlling",
      expect.any(Function),
    );
    expect(serwist.messageSkipWaiting).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();

    controllingHandler?.({ isExternal: true });
    expect(reload).not.toHaveBeenCalled();

    controllingHandler?.({ isExternal: false });
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe("PWA Phase 4 regression", () => {
  it("leaves ConnectivityBanner and install UX unchanged", () => {
    const layoutSource = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
    const welcome = readFileSync(
      join(root, "src/features/welcome/WelcomeScreen.tsx"),
      "utf8",
    );
    expect(layoutSource).toContain("ConnectivityBanner");
    expect(welcome).toContain("PwaInstallAction");
  });

  it("preserves Phase 3 offline precache and fallbacks", () => {
    const routeSource = readFileSync(
      join(root, "src/app/serwist/[path]/route.ts"),
      "utf8",
    );
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    expect(routeSource).toContain('url: "/offline"');
    expect(swSource).toContain("fallbacks:");
  });

  it("keeps provider reloadOnOnline disabled and a single Serwist instance", () => {
    const provider = readFileSync(
      join(root, "src/features/pwa/TabiSerwistProvider.client.tsx"),
      "utf8",
    );
    expect(provider).toContain("reloadOnOnline={false}");
    expect(provider).toContain("SerwistProvider");
    expect(provider).not.toContain("new Serwist");
  });
});
