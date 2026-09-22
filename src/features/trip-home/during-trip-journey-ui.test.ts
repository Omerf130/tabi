import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("during trip journey UI contracts", () => {
  it("renders vertical today sections without legacy plan timeline", () => {
    const journeySource = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTripJourney.tsx"),
      "utf8",
    );

    expect(journeySource).toContain("LaterTodaySection");
    expect(journeySource).toContain("DuringFullDayLink");
    expect(journeySource).not.toContain("TodaysPlanSection");
    expect(journeySource).not.toContain("TripHomeRemindersEntry");
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
