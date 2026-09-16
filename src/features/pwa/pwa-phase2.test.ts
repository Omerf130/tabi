import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTabiRuntimeCaching } from "./sw-runtime-caching";

const root = process.cwd();

describe("PWA Phase 2 architecture", () => {
  it("uses a single Service Worker source", () => {
    expect(
      readFileSync(join(root, "src/app/sw.ts"), "utf8"),
    ).toContain("createTabiRuntimeCaching");
  });

  it("does not use Serwist defaultCache", () => {
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    const runtimeSource = readFileSync(
      join(root, "src/features/pwa/sw-runtime-caching.ts"),
      "utf8",
    );

    expect(swSource).not.toContain("defaultCache");
    expect(runtimeSource).not.toContain("defaultCache");
  });

  it("does not use generic image extension matchers", () => {
    const files = [
      "src/app/sw.ts",
      "src/features/pwa/sw-runtime-caching.ts",
      "src/features/pwa/pwa-request-policy.ts",
    ];

    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      expect(source).not.toMatch(/\\\.(?:png|jpg|jpeg|webp|svg)/i);
    }
  });

  it("configures conservative lifecycle flags", () => {
    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    expect(swSource).toContain("skipWaiting: false");
    expect(swSource).toContain("clientsClaim: false");
    expect(swSource).not.toContain("skipWaiting: true");
  });

  it("registers Serwist at /serwist/sw.js with scope /", () => {
    const provider = readFileSync(
      join(root, "src/features/pwa/TabiSerwistProvider.client.tsx"),
      "utf8",
    );
    expect(provider).toContain('swUrl="/serwist/sw.js"');
    expect(provider).toContain('scope: "/"');
    expect(provider).toContain('NODE_ENV === "development"');
  });

  it("builds runtime caching with a NetworkOnly fallback", () => {
    const rules = createTabiRuntimeCaching();
    expect(rules.length).toBeGreaterThanOrEqual(3);
    expect(rules.at(-1)?.handler.constructor.name).toBe("NetworkOnly");
  });
});

describe("PWA Phase 2 package guardrails", () => {
  it("uses turbopack Serwist integration only", () => {
    const pkg = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    ) as { devDependencies: Record<string, string> };

    expect(pkg.devDependencies["@serwist/turbopack"]).toBeTruthy();
    expect(pkg.devDependencies["serwist"]).toBeTruthy();
    expect(pkg.devDependencies["@serwist/next"]).toBeUndefined();
    expect(pkg.devDependencies["next-pwa"]).toBeUndefined();
    expect(pkg.devDependencies["workbox"]).toBeUndefined();
  });
});

describe("PWA Phase 2 install UX regression guard", () => {
  it("does not modify install feature behavior in Welcome", () => {
    const welcome = readFileSync(
      join(root, "src/features/welcome/WelcomeScreen.tsx"),
      "utf8",
    );
    expect(welcome).toContain("PwaInstallAction");
    expect(welcome).not.toContain("SerwistProvider");
  });
});
