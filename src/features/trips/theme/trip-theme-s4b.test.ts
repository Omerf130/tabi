import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TRIP_THEME_REGISTRY } from "./trip-theme-registry";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const GLOBAL_PRE_TRIP_FILES = [
  "app/page.tsx",
  "app/login/page.tsx",
  "app/register/page.tsx",
  "app/app/page.tsx",
  "app/app/trips/page.tsx",
  "app/app/trips/new/page.tsx",
  "app/app/account/profile/page.tsx",
  "features/welcome/WelcomeScreen.tsx",
  "features/my-trips/MyTripsScreen.tsx",
  "features/account/AccountShell.tsx",
  "app/app/account/profile/page.tsx",
] as const;

const STATUS_TOKENS = [
  "--color-danger",
  "--color-success",
  "--color-warning",
  "--color-danger-soft",
  "--color-success-soft",
  "--color-warning-soft",
] as const;

describe("S4B Trip theme runtime + Ocean reference theme", () => {
  it("passes resolved themeKey from trip layout into TripShellLayout", () => {
    const layout = read("app/app/trips/[tripId]/layout.tsx");
    expect(layout).toContain("themeKey={trip.themeKey}");
    expect(layout).toContain("TripShellLayout");
  });

  it("sets data-trip-theme on TripShellLayout theme scope root", () => {
    const shell = read("features/app-shell/TripShellLayout.tsx");
    expect(shell).toContain("themeKey: TripThemeKey");
    expect(shell).toMatch(/data-trip-theme=\{themeKey\}/);
    expect(shell).toContain("styles.themeScope");
    expect(shell).not.toMatch(/useEffect|localStorage|document\.cookie/);
  });

  it("loads scoped trip theme overrides from globals", () => {
    const globals = read("styles/globals.scss");
    expect(globals).toContain("@use \"../features/trips/theme/trip-themes\"");
  });

  it("defines Ocean semantic overrides without status or default redefinition", () => {
    const themes = read("features/trips/theme/trip-themes.scss");
    expect(themes).toContain('[data-trip-theme="ocean"]');
    expect(themes).not.toContain('[data-trip-theme="default"]');
    expect(themes).toContain("--color-primary:");
    expect(themes).toContain("--color-background:");
    expect(themes).toContain("--color-surface-themed:");
    expect(themes).toContain("--color-accent-well:");
    expect(themes).toContain("--color-shell-border:");
    expect(themes).toContain("--color-nav-muted:");

    for (const token of STATUS_TOKENS) {
      expect(themes).not.toContain(`${token}:`);
    }
  });

  it("does not use component-specific Ocean selectors", () => {
    const themes = read("features/trips/theme/trip-themes.scss");
    expect(themes).not.toMatch(/\[data-trip-theme="ocean"\]\s+\./);
    expect(themes).not.toMatch(/\[data-trip-theme="ocean"\]\s+\[/);
  });

  it("defines Sakura, Forest, and Sunset semantic overrides like Ocean", () => {
    const themes = read("features/trips/theme/trip-themes.scss");
    for (const key of ["sakura", "forest", "sunset"] as const) {
      expect(themes).toContain(`[data-trip-theme="${key}"]`);
      expect(themes).not.toMatch(
        new RegExp(`\\[data-trip-theme="${key}"\\]\\s+\\.`),
      );
    }
  });

  it("keeps theme palette out of TypeScript registry", () => {
    for (const theme of TRIP_THEME_REGISTRY) {
      const serialized = JSON.stringify(theme);
      expect(serialized).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(serialized.toLowerCase()).not.toContain("gradient");
    }
  });

  it("does not attach data-trip-theme to global or pre-trip shells", () => {
    for (const file of GLOBAL_PRE_TRIP_FILES) {
      const source = read(file);
      expect(source, file).not.toContain("data-trip-theme");
    }
  });

  it("allows data-trip-theme only on TripShellLayout in production TSX", () => {
    const offenders: string[] = [];
    function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") {
            continue;
          }
          walk(full);
        } else if (
          entry.name.endsWith(".tsx") &&
          !entry.name.endsWith(".test.tsx")
        ) {
          const relative = full.replace(/\\/g, "/").replace(/^.*\/src\//, "");
          if (relative === "features/app-shell/TripShellLayout.tsx") {
            continue;
          }
          const source = readFileSync(full, "utf8");
          if (source.includes("data-trip-theme")) {
            offenders.push(relative);
          }
        }
      }
    }
    walk(root);
    expect(offenders).toEqual([]);
  });

  it("does not implement dark mode or client theme switching", () => {
    const themes = read("features/trips/theme/trip-themes.scss");
    expect(themes).not.toContain("prefers-color-scheme");
    const shell = read("features/app-shell/TripShellLayout.tsx");
    expect(shell).not.toContain("localStorage");
    expect(shell).not.toContain("useEffect");
  });
});
