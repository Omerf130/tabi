import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

const root = process.cwd();

describe("PWA Phase 1 manifest", () => {
  it("exports approved installability values", () => {
    const m = manifest();

    expect(m.name).toBe("Tabi");
    expect(m.short_name).toBe("Tabi");
    expect(m.start_url).toBe("/");
    expect(m.scope).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.orientation).toBe("any");
    expect(m.background_color).toBe("#f4f5f8");
    expect(m.theme_color).toBe("#1a2740");
  });

  it("references standard and maskable icons", () => {
    const icons = manifest().icons ?? [];
    const srcs = icons.map((icon) => icon.src);

    expect(srcs).toContain("/icons/icon-192.png");
    expect(srcs).toContain("/icons/icon-512.png");
    expect(
      icons.some(
        (icon) =>
          icon.src === "/icons/icon-maskable-512.png" &&
          icon.purpose === "maskable",
      ),
    ).toBe(true);
  });
});

describe("PWA Phase 1 icon assets", () => {
  const requiredPaths = [
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/icons/icon-maskable-512.png",
    "src/app/apple-icon.png",
    "src/app/icon.png",
  ];

  it.each(requiredPaths)("includes production asset %s", (relativePath) => {
    expect(existsSync(join(root, relativePath))).toBe(true);
  });
});

describe("PWA Phase 1 root metadata and start URL", () => {
  it("keeps viewportFit cover and canonical themeColor", () => {
    const layoutSource = readFileSync(
      join(root, "src/app/layout.tsx"),
      "utf8",
    );

    expect(layoutSource).toContain('viewportFit: "cover"');
    expect(layoutSource).toContain('themeColor: "#1a2740"');
    expect(layoutSource).toContain('title: "Tabi"');
    expect(layoutSource).toContain("appleWebApp");
  });

  it("redirects authenticated users from / to /app server-side", () => {
    const homeSource = readFileSync(join(root, "src/app/page.tsx"), "utf8");

    expect(homeSource).toContain("getCurrentUser");
    expect(homeSource).toContain('redirect("/app")');
    expect(homeSource).toContain("WelcomeScreen");
  });
});

describe("PWA Phase 1 — no service worker in repo scripts", () => {
  it("does not add Serwist or legacy PWA packages", () => {
    const pkg = readFileSync(join(root, "package.json"), "utf8");

    expect(pkg).not.toMatch(/@serwist\/next|next-pwa|workbox/i);
  });
});
