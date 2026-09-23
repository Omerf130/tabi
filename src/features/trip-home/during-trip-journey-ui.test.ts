import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("during trip journey UI contracts", () => {
  it("renders vertical today sections without legacy plan timeline", () => {
    const journeySource = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTripJourney.tsx"),
      "utf8",
    );

    expect(journeySource).toContain("duringTodaySurface");
    expect(journeySource).toContain("LaterTodaySection");
    expect(journeySource).toContain("DuringFullDayLink");
    expect(journeySource).not.toContain("TodaysPlanSection");
    expect(journeySource).not.toContain("TripHomeRemindersEntry");
  });

  it("keeps Today sections on transparent theme-backed page (no parent card)", () => {
    const scss = readFileSync(
      join(process.cwd(), "src/features/trip-home/TripHomeContent.module.scss"),
      "utf8",
    );
    const appPage = readFileSync(
      join(process.cwd(), "src/features/app-shell/AppPage.module.scss"),
      "utf8",
    );
    const laterToday = readFileSync(
      join(process.cwd(), "src/features/trip-home/LaterTodaySection.tsx"),
      "utf8",
    );

    expect(scss).toContain(".duringTodaySurface");
    expect(scss).toMatch(/\.duringTodaySurface[\s\S]*?background:\s*transparent/);
    expect(scss).not.toMatch(
      /\.duringTodaySurface[\s\S]{0,400}background:\s*var\(--color-surface-home-page\)/,
    );
    expect(scss).not.toMatch(/\.duringTodaySurface[\s\S]{0,200}flex:\s*1/);
    expect(scss).toMatch(/\.activityCompactCard/);
    expect(laterToday).toContain("laterTodayPanel");
    expect(scss).toMatch(/\.duringSurfaceSection[\s\S]*?background:\s*transparent/);
    expect(appPage).toMatch(/\[data-flush-top="true"\][\s\S]*padding-inline:\s*var\(--space-2\)/);
    expect(appPage).not.toMatch(/\[data-flush-top="true"\][\s\S]{0,200}min-height:\s*calc/);
  });

  it("supports intentional three-tile summary layout and weather tile markup", () => {
    const summary = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTodaySummary.tsx"),
      "utf8",
    );
    const scss = readFileSync(
      join(process.cwd(), "src/features/trip-home/TripHomeContent.module.scss"),
      "utf8",
    );

    expect(summary).toContain("resolveDuringSummaryWideTileId");
    expect(summary).toContain('data-count={tiles.length}');
    expect(summary).toContain("weatherLabel");
    expect(summary).toContain("duringSummaryIcon");
    expect(scss).toContain('[data-count="3"]');
    expect(scss).not.toMatch(/duringSummaryTile[\s\S]{0,80}display:\s*none/);
  });

  it("defines semantic home page surface token for all trip themes", () => {
    const themes = readFileSync(
      join(process.cwd(), "src/features/trips/theme/trip-themes.scss"),
      "utf8",
    );
    const tokens = readFileSync(join(process.cwd(), "src/styles/tokens.scss"), "utf8");

    expect(tokens).toContain("--color-surface-home-page");
    expect(themes).toContain('[data-trip-theme="default"]');
    expect(themes).toMatch(/\[data-trip-theme="ocean"\][\s\S]*--color-surface-home-page/);
    expect(themes).toMatch(/\[data-trip-theme="sakura"\][\s\S]*--color-surface-home-page/);
    expect(themes).toMatch(/\[data-trip-theme="forest"\][\s\S]*--color-surface-home-page/);
    expect(themes).toMatch(/\[data-trip-theme="sunset"\][\s\S]*--color-surface-home-page/);
  });

  it("keeps optional NOW and UP NEXT cards conditional", () => {
    const journeySource = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTripJourney.tsx"),
      "utf8",
    );

    expect(journeySource).toMatch(/\{model\.now \?/);
    expect(journeySource).toMatch(/\{model\.upNext \?/);
  });

  it("uses a responsive summary grid without horizontal scroll", () => {
    const summarySource = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTodaySummary.tsx"),
      "utf8",
    );
    const scss = readFileSync(
      join(process.cwd(), "src/features/trip-home/TripHomeContent.module.scss"),
      "utf8",
    );

    expect(summarySource).toContain("duringSummaryGrid");
    expect(scss).toContain(".duringSummaryGrid");
    expect(scss).not.toMatch(/duringSummaryGrid[\s\S]{0,200}overflow-x:\s*auto/);
  });
});
