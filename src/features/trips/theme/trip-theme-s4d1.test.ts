import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  TRIP_THEME_ATMOSPHERE_LAYERS,
  TRIP_THEME_ATMOSPHERE_PREVIEW_SRC,
} from "./trip-theme-atmosphere-assets";

const projectRoot = process.cwd();
const root = join(projectRoot, "src");
const atmosphereTsx = readFileSync(
  join(root, "features/trips/theme/TripThemeAtmosphere.tsx"),
  "utf8",
);
const atmosphereScss = readFileSync(
  join(root, "features/trips/theme/TripThemeAtmosphere.module.scss"),
  "utf8",
);
const shellSource = readFileSync(
  join(root, "features/app-shell/TripShellLayout.tsx"),
  "utf8",
);
const homeStyles = readFileSync(
  join(root, "features/trip-home/TripHomeContent.module.scss"),
  "utf8",
);
const hubStyles = readFileSync(
  join(root, "features/travel-hub/TravelHub.module.scss"),
  "utf8",
);

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

describe("S4D.1 real theme atmosphere PNG integration", () => {
  it("maps themes to existing public/themes PNG paths", () => {
    for (const asset of EXPECTED_PNG_ASSETS) {
      expect(existsSync(join(projectRoot, asset))).toBe(true);
    }
    expect(TRIP_THEME_ATMOSPHERE_LAYERS.default).toEqual([]);
    expect(TRIP_THEME_ATMOSPHERE_LAYERS.ocean.map((l) => l.src)).toEqual([
      "/themes/ocean/top-wave.png",
      "/themes/ocean/wave.png",
      "/themes/ocean/wave.png",
    ]);
    expect(TRIP_THEME_ATMOSPHERE_LAYERS.sakura.map((l) => l.src)).toEqual([
      "/themes/Sakura/sakura-top.png",
      "/themes/Sakura/sakura.png",
      "/themes/Sakura/sakura-bottom.png",
    ]);
    expect(TRIP_THEME_ATMOSPHERE_LAYERS.forest.map((l) => l.src)).toEqual([
      "/themes/forest/forest-top.png",
      "/themes/forest/forest-bottom.png",
    ]);
    expect(TRIP_THEME_ATMOSPHERE_LAYERS.sunset.map((l) => l.src)).toEqual([
      "/themes/Sunset/sunset.png",
    ]);
  });

  it("renders TripThemeAtmosphere from TripShellLayout with accessible decorative imgs", () => {
    expect(shellSource).toContain("TripThemeAtmosphere");
    expect(atmosphereTsx).toContain('aria-hidden="true"');
    expect(atmosphereTsx).toContain('alt=""');
    expect(atmosphereTsx).toContain("<img");
    expect(atmosphereScss).toContain("pointer-events: none");
    expect(atmosphereScss).toContain("user-select: none");
    expect(atmosphereTsx).not.toContain("useEffect");
    expect(atmosphereTsx).not.toContain("useState");
  });

  it("does not use legacy SVG atmosphere paths in the atmosphere component styles", () => {
    expect(atmosphereScss).not.toContain("/theme-atmosphere/");
    expect(atmosphereTsx).not.toContain("/theme-atmosphere/");
  });

  it("keeps artwork behind shell content and exposes theme workspace background", () => {
    const shellLayoutScss = readFileSync(
      join(root, "features/app-shell/TripShellLayout.module.scss"),
      "utf8",
    );
    expect(shellLayoutScss).toContain("background-color: var(--color-background)");
    expect(shellLayoutScss).toMatch(/\.shell[\s\S]*background-color:\s*transparent/);
    expect(homeStyles).toMatch(/\.home[\s\S]*background:\s*transparent/);
    expect(hubStyles).toMatch(/\.hub[\s\S]*background:\s*transparent/);
  });

  it("uses appearance preview hints from the same PNG library", () => {
    expect(TRIP_THEME_ATMOSPHERE_PREVIEW_SRC.ocean).toBe(
      "/themes/ocean/top-wave.png",
    );
    const appearanceStyles = readFileSync(
      join(root, "features/settings/appearance/AppearanceSettings.module.scss"),
      "utf8",
    );
    expect(appearanceStyles).toContain("/themes/ocean/top-wave.png");
    expect(appearanceStyles).toContain("/themes/Sakura/sakura-top.png");
    expect(appearanceStyles).not.toContain("/theme-atmosphere/");
  });

  it("does not mount atmosphere outside TripShellLayout", () => {
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
          if (
            relative === "features/app-shell/TripShellLayout.tsx" ||
            relative === "features/trips/theme/TripThemeAtmosphere.tsx"
          ) {
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

  it("avoids external URLs, Canvas, WebGL, and scroll parallax", () => {
    expect(atmosphereTsx).not.toMatch(/https?:\/\//);
    expect(atmosphereScss).not.toMatch(/https?:\/\//);
    expect(atmosphereTsx).not.toMatch(/canvas|webgl|video/i);
    expect(atmosphereScss).not.toContain("scroll-timeline");
    expect(shellSource).not.toContain("parallax");
  });
});
