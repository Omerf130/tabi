import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const S3C_SCSS = [
  "features/trip-home/TripHomeContent.module.scss",
  "features/trip-home/TripHomeRemindersManager.module.scss",
  "features/itinerary/ItineraryPage.module.scss",
  "features/itinerary/ItineraryExperience.module.scss",
  "features/itinerary/DayPage.module.scss",
  "features/itinerary/ActivityForm.module.scss",
  "features/itinerary/AddItemFlow.module.scss",
];

const SEMANTIC_TOKENS = [
  "--color-background",
  "--color-surface",
  "--color-surface-elevated",
  "--color-text",
  "--color-text-muted",
  "--color-border",
  "--color-link",
  "--color-scrim",
  "--shadow-sm",
  "--shadow-sheet",
];

describe("S3C Trip Core token migration", () => {
  it("keeps S3C SCSS free of legacy burgundy/cream structural hex", () => {
    for (const file of S3C_SCSS) {
      const source = read(file).toLowerCase();
      expect(source).not.toContain("#7a2e38");
      expect(source).not.toContain("#f3eee6");
      expect(source).not.toContain("#fbf7f1");
    }
  });

  it("maps Trip Home root structural aliases to semantic tokens", () => {
    const home = read("features/trip-home/TripHomeContent.module.scss");
    expect(home).toContain("--trip-home-text: var(--color-text)");
    expect(home).toContain("--trip-home-surface: var(--color-surface)");
    expect(home).toContain("background: transparent");
  });

  it("retains itinerary domain purple without promoting to global primary", () => {
    const experience = read("features/itinerary/ItineraryExperience.module.scss");
    expect(experience).toContain("--itinerary-primary: #5b4fd6");
    expect(experience).not.toMatch(
      /--itinerary-primary:\s*var\(--color-primary\)/,
    );
  });

  it("uses semantic tokens for generic Trip Core sheets/dialogs", () => {
    const reminders = read("features/trip-home/TripHomeRemindersManager.module.scss");
    expect(reminders).toContain("var(--color-surface-elevated)");
    expect(reminders).toContain("var(--color-scrim)");
    expect(reminders).toContain("var(--shadow-sheet)");

    const day = read("features/itinerary/DayPage.module.scss");
    expect(day).toContain("var(--color-scrim)");
    expect(day).toContain("var(--color-surface-elevated)");
    expect(day).toContain("var(--shadow-sheet)");
  });

  it("does not introduce trip theme hooks in Trip Core", () => {
    for (const file of S3C_SCSS) {
      const source = read(file);
      expect(source).not.toContain("data-trip-theme");
      expect(source).not.toContain("themeKey");
    }
  });

  it("uses semantic tokens in each S3C stylesheet", () => {
    for (const file of S3C_SCSS) {
      const source = read(file);
      const usesSemantic = SEMANTIC_TOKENS.some((token) =>
        source.includes(token),
      );
      expect(usesSemantic, file).toBe(true);
    }
  });
});
