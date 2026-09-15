import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toTripWorkspace } from "../public-trip";
import {
  DEFAULT_TRIP_THEME_KEY,
  TRIP_THEME_KEYS,
  TRIP_THEME_REGISTRY,
  listSelectableTripThemes,
  resolveTripThemeKey,
  tripThemeKeySchema,
} from "./index";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("S4A Trip theme domain foundation", () => {
  it("defines a finite curated theme key set with default as default", () => {
    expect(TRIP_THEME_KEYS).toEqual([
      "default",
      "ocean",
      "sakura",
      "forest",
      "sunset",
    ]);
    expect(DEFAULT_TRIP_THEME_KEY).toBe("default");
    expect(TRIP_THEME_REGISTRY).toHaveLength(TRIP_THEME_KEYS.length);
    expect(listSelectableTripThemes().map((theme) => theme.key)).toEqual([
      "default",
      "ocean",
    ]);
  });

  it("registry carries domain metadata only (no CSS or visual values)", () => {
    for (const theme of TRIP_THEME_REGISTRY) {
      expect(theme.nameMessageKey).toMatch(/^themes\.[a-z]+\.name$/);
      expect(theme.descriptionMessageKey).toMatch(/^themes\.[a-z]+\.description$/);
      expect(JSON.stringify(theme).toLowerCase()).not.toContain("#");
      expect(JSON.stringify(theme).toLowerCase()).not.toContain("gradient");
      expect(JSON.stringify(theme).toLowerCase()).not.toContain("var(--");
    }
  });

  it("resolveTripThemeKey returns valid keys unchanged and falls back otherwise", () => {
    expect(resolveTripThemeKey("ocean")).toBe("ocean");
    expect(resolveTripThemeKey(undefined)).toBe("default");
    expect(resolveTripThemeKey(null)).toBe("default");
    expect(resolveTripThemeKey("")).toBe("default");
    expect(resolveTripThemeKey("burgundy")).toBe("default");
  });

  it("tripThemeKeySchema accepts valid keys and rejects arbitrary strings", () => {
    for (const key of TRIP_THEME_KEYS) {
      expect(tripThemeKeySchema.parse(key)).toBe(key);
    }
    expect(tripThemeKeySchema.safeParse("custom-theme").success).toBe(false);
  });

  it("Trip model declares validated themeKey with schema default", () => {
    const tripModel = read("models/Trip.ts");
    expect(tripModel).toContain("themeKey:");
    expect(tripModel).toContain("TRIP_THEME_KEYS");
    expect(tripModel).toContain("DEFAULT_TRIP_THEME_KEY");
  });

  it("new trips persist default theme without wizard selection", () => {
    const createTrip = read("features/trips/create-trip.ts");
    expect(createTrip).toContain("themeKey: DEFAULT_TRIP_THEME_KEY");
    const wizardSchema = read("features/trips/schemas.ts");
    expect(wizardSchema).toContain(".strict()");
    expect(wizardSchema).not.toContain("themeKey");
  });

  it("workspace projection resolves missing legacy themeKey to default", () => {
    const workspace = toTripWorkspace(
      {
        _id: { toString: () => "trip-legacy" },
        name: "Legacy Trip",
        startDate: "2026-01-01",
        endDate: "2026-01-07",
      },
      "member",
    );
    expect(workspace.themeKey).toBe("default");
  });

  it("does not add theme to User or session layers", () => {
    const userModel = read("models/User.ts");
    expect(userModel.toLowerCase()).not.toContain("themekey");
    expect(userModel.toLowerCase()).not.toContain("trippheme");
  });

});
