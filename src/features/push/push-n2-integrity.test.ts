import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { classifyPwaRequest, PwaCachePolicy } from "@/features/pwa/pwa-request-policy";

const root = process.cwd();

describe("Push N2 integrity", () => {
  it("registers push and notificationclick after Serwist listeners", () => {
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    const serwistIndex = swSource.indexOf("serwist.addEventListeners()");
    const registerIndex = swSource.indexOf(
      "registerTabiPushNotificationListeners(self)",
    );
    expect(serwistIndex).toBeGreaterThan(-1);
    expect(registerIndex).toBeGreaterThan(serwistIndex);
  });

  it("wires push handlers without fetch or cache in the registration module", () => {
    const pushSource = readFileSync(
      join(root, "src/features/push/register-tab-push-notification-listeners.ts"),
      "utf8",
    );
    expect(pushSource).toMatch(/addEventListener\(\s*["']push["']/);
    expect(pushSource).toMatch(/addEventListener\(\s*["']notificationclick["']/);
    expect(pushSource).toContain("showNotification");
    expect(pushSource).not.toMatch(/\bfetch\s*\(/);
    expect(pushSource).not.toContain("caches");
    expect(pushSource).not.toContain("indexedDB");
    expect(pushSource).not.toContain("skipWaiting");
  });

  it("keeps skipWaiting false in the service worker", () => {
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    expect(swSource).toContain("skipWaiting: false");
    expect(swSource).not.toContain("skipWaiting: true");
  });

  it("keeps Serwist lifecycle wiring intact", () => {
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    expect(swSource).toContain("clientsClaim: true");
    expect(swSource).toContain("createTabiRuntimeCaching");
    expect(swSource).toContain("shouldServeOfflineDocumentFallback");
  });

  it("keeps account notification routes on private network-only paths", () => {
    expect(
      classifyPwaRequest({
        url: "https://tabi.example/app/account/notifications",
        method: "GET",
        headers: {},
        destination: "document",
        mode: "navigate",
      }),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

});
