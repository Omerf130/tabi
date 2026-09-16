import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import enMessages from "../../../../messages/en.json";
import heMessages from "../../../../messages/he.json";
import { TRIP_THEME_KEYS } from "./trip-theme-keys";
import {
  TRIP_THEME_REGISTRY,
  isTripThemeSelectable,
  listSelectableTripThemes,
} from "./trip-theme-registry";
import { updateTripThemeSchema } from "./update-trip-theme-schema";

const root = join(process.cwd(), "src");
const themesPath = join(root, "features/trips/theme/trip-themes.scss");
const appearanceStylesPath = join(
  root,
  "features/settings/appearance/AppearanceSettings.module.scss",
);

const themesSource = readFileSync(themesPath, "utf8");
const appearanceStyles = readFileSync(appearanceStylesPath, "utf8");

const SELECTABLE_KEYS = [
  "default",
  "ocean",
  "sakura",
  "forest",
  "sunset",
] as const;

const DEPTH_TOKENS = [
  "--color-surface-themed",
  "--color-surface-themed-strong",
  "--color-surface-card",
  "--color-accent-well",
  "--color-shell-surface",
] as const;

const SEMANTIC_THEME_TOKENS = [
  "--color-primary:",
  "--color-background:",
  "--color-surface:",
  "--color-text:",
  "--color-text-muted:",
  "--color-link:",
  "--color-focus:",
  "--color-on-primary:",
] as const;

const STATUS_TOKENS = [
  "--color-danger:",
  "--color-success:",
  "--color-warning:",
] as const;

function extractThemeBlock(key: string): string {
  const marker = `[data-trip-theme="${key}"]`;
  const start = themesSource.indexOf(marker);
  if (start === -1) {
    return "";
  }
  const next = themesSource.indexOf("[data-trip-theme=", start + marker.length);
  return next === -1 ? themesSource.slice(start) : themesSource.slice(start, next);
}

describe("S4D complete Trip theme library", () => {
  it("enables all five themes in registry order", () => {
    expect(TRIP_THEME_REGISTRY.map((t) => t.key)).toEqual([...TRIP_THEME_KEYS]);
    expect(listSelectableTripThemes().map((t) => t.key)).toEqual([
      ...SELECTABLE_KEYS,
    ]);
    for (const key of SELECTABLE_KEYS) {
      expect(isTripThemeSelectable(key)).toBe(true);
    }
  });

  it("defines runtime selectors for ocean and the three new palettes", () => {
    for (const key of ["ocean", "sakura", "forest", "sunset"] as const) {
      expect(themesSource).toContain(`[data-trip-theme="${key}"]`);
    }
    expect(themesSource).not.toContain('[data-trip-theme="default"]');
  });

  it("uses semantic token overrides for each themed block with required depth tokens", () => {
    for (const key of ["ocean", "sakura", "forest", "sunset"] as const) {
      const block = extractThemeBlock(key);
      for (const token of SEMANTIC_THEME_TOKENS) {
        expect(block).toContain(token);
      }
      for (const token of DEPTH_TOKENS) {
        expect(block).toContain(`${token}:`);
      }
      for (const token of STATUS_TOKENS) {
        expect(block).not.toContain(token);
      }
    }
  });

  it("does not use component-specific theme selectors in trip-themes.scss", () => {
    expect(themesSource).not.toMatch(
      /\[data-trip-theme="[a-z]+"\]\s+\./,
    );
    expect(themesSource).not.toMatch(
      /\[data-trip-theme="[a-z]+"\]\s+\[/,
    );
  });

  it("provides CSS-only preview palettes for all five themes", () => {
    for (const key of SELECTABLE_KEYS) {
      expect(appearanceStyles).toContain(`[data-preview-theme="${key}"]`);
    }
    expect(appearanceStyles).not.toContain("[data-trip-theme");
  });

  it("keeps palette hex out of TypeScript registry", () => {
    for (const theme of TRIP_THEME_REGISTRY) {
      expect(JSON.stringify(theme)).not.toMatch(/#[0-9a-f]{3,8}/i);
    }
  });

  it("includes polished HE/EN names and mood descriptions for all themes", () => {
    expect(enMessages.TripTheme.themes.default.name).toBe("Tabi Default");
    expect(enMessages.TripTheme.themes.sakura.name).toBe("Sakura");
    expect(enMessages.TripTheme.themes.forest.name).toBe("Forest");
    expect(enMessages.TripTheme.themes.sunset.name).toBe("Sunset");
    expect(heMessages.TripTheme.themes.default.name).toBe("ברירת המחדל של Tabi");
    expect(heMessages.TripTheme.themes.sakura.name).toBe("סאקורה");
    expect(heMessages.TripTheme.themes.forest.name).toBe("יער");
    expect(heMessages.TripTheme.themes.sunset.name).toBe("שקיעה");
    for (const key of SELECTABLE_KEYS) {
      const enDesc = enMessages.TripTheme.themes[key].description;
      const heDesc = heMessages.TripTheme.themes[key].description;
      expect(enDesc.length).toBeGreaterThan(10);
      expect(heDesc.length).toBeGreaterThan(5);
      expect(enDesc.toLowerCase()).not.toContain("coming");
      expect(heDesc).not.toContain("עתידי");
    }
  });

  it("update schema accepts all selectable keys and rejects invalid theme", () => {
    for (const key of SELECTABLE_KEYS) {
      expect(
        updateTripThemeSchema.safeParse({
          tripId: "507f1f77bcf86cd799439011",
          themeKey: key,
        }).success,
      ).toBe(true);
    }
    expect(
      updateTripThemeSchema.safeParse({
        tripId: "507f1f77bcf86cd799439011",
        themeKey: "custom",
      }).success,
    ).toBe(false);
  });

  it("does not attach data-trip-theme outside TripShellLayout", () => {
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

  it("does not add dark mode or custom theme architecture", () => {
    expect(themesSource).not.toContain("prefers-color-scheme");
    const registryJson = JSON.stringify(TRIP_THEME_REGISTRY);
    expect(registryJson.toLowerCase()).not.toContain("dark");
    expect(registryJson.toLowerCase()).not.toContain("custom");
  });
});
