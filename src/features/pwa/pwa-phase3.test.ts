import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { shouldShowConnectivityBanner } from "./ConnectivityBanner.client";
import { shouldServeOfflineDocumentFallback } from "./pwa-request-policy";

const root = process.cwd();

describe("PWA Phase 3 connectivity banner", () => {
  it("hides the banner when online", () => {
    expect(shouldShowConnectivityBanner(true)).toBe(false);
  });

  it("shows the banner when offline", () => {
    expect(shouldShowConnectivityBanner(false)).toBe(true);
  });

  it("does not add global submit interception", () => {
    const bannerSource = readFileSync(
      join(root, "src/features/pwa/ConnectivityBanner.client.tsx"),
      "utf8",
    );
    const layoutSource = readFileSync(join(root, "src/app/layout.tsx"), "utf8");

    expect(bannerSource).not.toContain("addEventListener(\"submit\"");
    expect(layoutSource).not.toContain("addEventListener(\"submit\"");
  });

  it("does not show a back-online notification", () => {
    const bannerSource = readFileSync(
      join(root, "src/features/pwa/ConnectivityBanner.client.tsx"),
      "utf8",
    );
    const messagesEn = readFileSync(join(root, "messages/en.json"), "utf8");
    const messagesHe = readFileSync(join(root, "messages/he.json"), "utf8");

    expect(bannerSource).not.toMatch(/back online|Back online/i);
    expect(messagesEn).not.toContain("Back online");
    expect(messagesHe).not.toContain("חזרת לאונליין");
  });

  it("defines Hebrew and English offline banner copy", () => {
    const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8")) as {
      Offline: Record<string, string>;
    };
    const he = JSON.parse(readFileSync(join(root, "messages/he.json"), "utf8")) as {
      Offline: Record<string, string>;
    };

    expect(en.Offline.bannerTitle).toBe("No internet connection");
    expect(he.Offline.bannerTitle).toBe("אין חיבור לאינטרנט");
    expect(en.Offline.pageTitle).toBe("You're offline");
    expect(he.Offline.tryAgain).toBe("נסה שוב");
  });

  it("mounts the banner in the root layout inside i18n", () => {
    const layoutSource = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
    expect(layoutSource).toContain("ConnectivityBanner");
    expect(layoutSource).toContain("NextIntlClientProvider");
    expect(layoutSource.indexOf("NextIntlClientProvider")).toBeLessThan(
      layoutSource.indexOf("ConnectivityBanner"),
    );
  });
});

describe("PWA Phase 3 offline fallback policy", () => {
  const base = {
    method: "GET",
    headers: {} as Record<string, string | undefined>,
  };

  it("allows document navigation fallback", () => {
    expect(
      shouldServeOfflineDocumentFallback({
        ...base,
        url: "https://tabi.example/app/trips/123/itinerary",
        mode: "navigate",
        destination: "document",
      }),
    ).toBe(true);
  });

  it("rejects RSC, actions, APIs, media, and /offline", () => {
    expect(
      shouldServeOfflineDocumentFallback({
        ...base,
        url: "https://tabi.example/app/trips/123",
        headers: { rsc: "1" },
        mode: "navigate",
      }),
    ).toBe(false);

    expect(
      shouldServeOfflineDocumentFallback({
        ...base,
        url: "https://tabi.example/app/trips/123?_rsc=abc",
        mode: "navigate",
      }),
    ).toBe(false);

    expect(
      shouldServeOfflineDocumentFallback({
        ...base,
        url: "https://tabi.example/app/trips/123",
        headers: { accept: "text/x-component" },
        mode: "navigate",
      }),
    ).toBe(false);

    expect(
      shouldServeOfflineDocumentFallback({
        method: "POST",
        headers: { "next-action": "abc" },
        url: "https://tabi.example/app/trips/123",
      }),
    ).toBe(false);

    expect(
      shouldServeOfflineDocumentFallback({
        ...base,
        url: "https://tabi.example/app/api/places/autocomplete",
        mode: "navigate",
      }),
    ).toBe(false);

    expect(
      shouldServeOfflineDocumentFallback({
        ...base,
        url: "https://tabi.example/_next/image?url=%2Fcover",
        destination: "image",
      }),
    ).toBe(false);

    expect(
      shouldServeOfflineDocumentFallback({
        ...base,
        url: "https://tabi.example/offline",
        mode: "navigate",
        destination: "document",
      }),
    ).toBe(false);
  });
});

describe("PWA Phase 3 precache and SW wiring", () => {
  it("precaches /offline only as the new document fallback", () => {
    const routeSource = readFileSync(
      join(root, "src/app/serwist/[path]/route.ts"),
      "utf8",
    );
    expect(routeSource).toContain('url: "/offline"');
    expect(routeSource).not.toContain('url: "/app"');
    expect(routeSource).not.toContain('url: "/"');
  });

  it("wires Serwist fallbacks to /offline", () => {
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    expect(swSource).toContain("fallbacks:");
    expect(swSource).toContain('url: "/offline"');
    expect(swSource).toContain("shouldServeOfflineDocumentFallback");
  });
});

describe("PWA Phase 3 Try Again", () => {
  it("reloads the current location without storage", () => {
    const tryAgainSource = readFileSync(
      join(root, "src/features/pwa/OfflineTryAgain.client.tsx"),
      "utf8",
    );
    expect(tryAgainSource).toContain("window.location.reload()");
    expect(tryAgainSource).not.toContain("localStorage");
    expect(tryAgainSource).not.toContain("sessionStorage");
    expect(tryAgainSource).not.toContain("returnTo");
  });
});

describe("PWA Phase 3 offline page", () => {
  it("is a generic public page without trip theme", () => {
    const pageSource = readFileSync(join(root, "src/app/offline/page.tsx"), "utf8");
    expect(pageSource).toContain('dynamic = "force-static"');
    expect(pageSource).not.toContain("tripId");
    expect(pageSource).not.toContain("TripShellLayout");
    expect(pageSource).not.toContain("data-trip-theme");
  });
});

describe("PWA Phase 3 regression", () => {
  it("leaves install UX unchanged", () => {
    const welcome = readFileSync(
      join(root, "src/features/welcome/WelcomeScreen.tsx"),
      "utf8",
    );
    expect(welcome).toContain("PwaInstallAction");
  });
});
