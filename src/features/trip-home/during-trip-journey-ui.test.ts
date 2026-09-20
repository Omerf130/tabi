import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("during trip journey UI contracts", () => {
  it("always renders today's plan without an outer isEmpty gate", () => {
    const journeySource = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTripJourney.tsx"),
      "utf8",
    );

    expect(journeySource).toContain("<TodaysPlanSection section={model.todaysPlan} />");
    expect(journeySource).not.toMatch(/!model\.todaysPlan\.isEmpty/);
  });

  it("restores timeline rendering and empty-day copy in TodaysPlanSection", () => {
    const planSource = readFileSync(
      join(process.cwd(), "src/features/trip-home/TodaysPlanSection.tsx"),
      "utf8",
    );

    expect(planSource).toContain("duringPlanTimeline");
    expect(planSource).toContain("TodaysPlanEmpty");
    expect(planSource).toContain("section.ctaHref");
    expect(
      readFileSync(
        join(process.cwd(), "src/features/trip-home/TodaysPlanEmpty.client.tsx"),
        "utf8",
      ),
    ).toContain('t("todaysPlanEmptyTitle")');
  });

  it("keeps optional NOW and UP NEXT cards conditional", () => {
    const journeySource = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTripJourney.tsx"),
      "utf8",
    );

    expect(journeySource).toMatch(/\{model\.now \?/);
    expect(journeySource).toMatch(/\{model\.upNext \?/);
  });
});
