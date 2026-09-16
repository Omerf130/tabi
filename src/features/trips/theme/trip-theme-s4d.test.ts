import { readFileSync, readdirSync, existsSync } from "node:fs";
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
const projectRoot = process.cwd();
const themesPath = join(root, "features/trips/theme/trip-themes.scss");
const atmosphereTsxPath = join(root, "features/trips/theme/TripThemeAtmosphere.tsx");
const atmosphereScssPath = join(
  root,
  "features/trips/theme/TripThemeAtmosphere.module.scss",
);
const shellPath = join(root, "features/app-shell/TripShellLayout.tsx");
const appearanceStylesPath = join(
  root,
  "features/settings/appearance/AppearanceSettings.module.scss",
);

const themesSource = readFileSync(themesPath, "utf8");
const atmosphereTsx = readFileSync(atmosphereTsxPath, "utf8");
const atmosphereScss = readFileSync(atmosphereScssPath, "utf8");
const shellSource = readFileSync(shellPath, "utf8");
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

const ATMOSPHERE_THEMES = ["default", "ocean", "sakura", "forest", "sunset"] as const;

const EXPECTED_PNG_ASSETS = [
  "public/themes/ocean/top-wave.png",
  "public/themes/ocean/wave.png",
  "public/themes/ocean/bottom-wave.png",
  "public/themes/Sakura/sakura-top.png",
  "public/themes/Sakura/sakura.png",
  "public/themes/Sakura/sakura-bottom.png",
  "public/themes/forest/forest-top.png",
  "public/themes/forest/forest-bottom.png",
  "public/themes/Sunset/sunset.png",
  "public/themes/Sunset/sunset2.png",
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

describe("S4D complete Trip theme library + atmosphere", () => {
  it("enables all five themes in registry order", () => {
    expect(TRIP_THEME_REGISTRY.map((t) => t.key)).toEqual([...TRIP_THEME_KEYS]);
    expect(listSelectableTripThemes().map((t) => t.key)).toEqual([
      ...SELECTABLE_KEYS,
    ]);
    for (const key of SELECTABLE_KEYS) {
      expect(isTripThemeSelectable(key)).toBe(true);
    }
  });

  it("renders TripThemeAtmosphere inside TripShellLayout only", () => {
    expect(shellSource).toContain("TripThemeAtmosphere");
    expect(shellSource).toContain("themeKey={themeKey}");

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
          if (relative === "features/trips/theme/TripThemeAtmosphere.tsx") {
            continue;
          }
          const source = readFileSync(full, "utf8");
          if (source.includes("TripThemeAtmosphere")) {
            offenders.push(relative);
          }
        }
      }
    }
    walk(root);
    expect(offenders).toEqual([]);
  });

  it("marks atmosphere decorative and non-interactive", () => {
    expect(atmosphereTsx).toContain('aria-hidden="true"');
    expect(atmosphereScss).toContain("pointer-events: none");
    expect(atmosphereTsx).not.toContain("useEffect");
    expect(atmosphereTsx).not.toContain("useState");
    expect(atmosphereTsx).not.toContain("connectDb");
  });

  it("defines atmosphere presentation for themed keys via PNG layers", () => {
    for (const key of ["ocean", "sakura", "forest", "sunset"] as const) {
      expect(atmosphereScss).toContain(`[data-atmosphere-theme="${key}"]`);
    }
    expect(atmosphereTsx).toContain("listTripThemeAtmosphereLayers");
    expect(atmosphereTsx).toContain("<img");
  });

  it("defines semantic atmosphere tokens per theme without palette on default", () => {
    for (const key of ATMOSPHERE_THEMES) {
      const block = extractThemeBlock(key);
      expect(block).toContain("--theme-atmosphere-primary:");
      expect(block).toContain("--theme-atmosphere-secondary:");
      expect(block).toContain("--theme-atmosphere-soft:");
    }
    const defaultBlock = extractThemeBlock("default");
    expect(defaultBlock).not.toContain("--color-primary:");
  });

  it("defines runtime palette selectors for ocean and the three new themes", () => {
    for (const key of ["ocean", "sakura", "forest", "sunset"] as const) {
      expect(themesSource).toContain(`[data-trip-theme="${key}"]`);
    }
  });

  it("uses semantic token overrides for each themed palette with required depth tokens", () => {
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

  it("uses local PNG theme artwork without external asset URLs", () => {
    for (const asset of EXPECTED_PNG_ASSETS) {
      expect(existsSync(join(projectRoot, asset))).toBe(true);
    }
    expect(atmosphereTsx).not.toMatch(/https?:\/\//);
    expect(atmosphereScss).not.toMatch(/https?:\/\//);
    expect(atmosphereScss).not.toContain("/theme-atmosphere/");
  });

  it("does not use Canvas, WebGL, video, or scroll-driven JS", () => {
    expect(atmosphereTsx).not.toMatch(/canvas|webgl|video/i);
    expect(atmosphereScss).not.toContain("scroll-timeline");
    expect(shellSource).not.toContain("parallax");
  });

  it("provides palette and atmosphere hints in Appearance previews for all five themes", () => {
    for (const key of SELECTABLE_KEYS) {
      expect(appearanceStyles).toContain(`[data-preview-theme="${key}"]`);
    }
    expect(appearanceStyles).toContain(".previewAtmosphere");
    expect(appearanceStyles).not.toContain("[data-trip-theme");
  });

  it("keeps palette hex out of TypeScript registry", () => {
    for (const theme of TRIP_THEME_REGISTRY) {
      expect(JSON.stringify(theme)).not.toMatch(/#[0-9a-f]{3,8}/i);
    }
  });

  it("includes polished HE/EN names and mood descriptions for all themes", () => {
    expect(enMessages.TripTheme.themes.default.name).toBe("Tabi Default");
    expect(heMessages.TripTheme.themes.sunset.name).toBe("שקיעה");
    for (const key of SELECTABLE_KEYS) {
      expect(enMessages.TripTheme.themes[key].description.length).toBeGreaterThan(10);
      expect(heMessages.TripTheme.themes[key].description.length).toBeGreaterThan(5);
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

  it("does not mutate cover from theme action", () => {
    const actionSource = readFileSync(
      join(root, "features/trips/theme/update-trip-theme-action.ts"),
      "utf8",
    );
    expect(actionSource).not.toContain("coverVisualKey");
  });

  it("does not add dark mode or custom theme architecture", () => {
    expect(themesSource).not.toContain("prefers-color-scheme");
    const registryJson = JSON.stringify(TRIP_THEME_REGISTRY);
    expect(registryJson.toLowerCase()).not.toContain("custom");
  });
});
