import { afterEach, describe, expect, it, vi } from "vitest";
import { getTripPhase } from "@/features/trips/trip-phase";
import {
  TRIP_HOME_PREVIEW_BEFORE_DAY_OFFSET,
  TRIP_HOME_PREVIEW_WALL_CLOCK_TIME,
  resolveTripHomePreviewContext,
} from "./resolve-trip-home-preview-context";

const tripDates = {
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

describe("resolveTripHomePreviewContext", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses startDate and active phase in development during preview", () => {
    vi.stubEnv("NODE_ENV", "development");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "during",
    });

    expect(context.isPreview).toBe(true);
    if (!context.isPreview) {
      return;
    }

    expect(context.todayJapan).toBe(tripDates.startDate);
    expect(context.nowJapanTime).toBe(TRIP_HOME_PREVIEW_WALL_CLOCK_TIME);
    expect(context.forcedPhase).toBe("active");
    expect(
      getTripPhase(tripDates.startDate, tripDates.endDate, context.todayJapan),
    ).toBe("active");
  });

  it("uses 30 days before startDate in development before preview", () => {
    vi.stubEnv("NODE_ENV", "development");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "before",
    });

    expect(context.isPreview).toBe(true);
    if (!context.isPreview) {
      return;
    }

    expect(context.todayJapan).toBe("2026-09-25");
    expect(TRIP_HOME_PREVIEW_BEFORE_DAY_OFFSET).toBe(-30);
    expect(context.forcedPhase).toBe("upcoming");
    expect(
      getTripPhase(tripDates.startDate, tripDates.endDate, context.todayJapan),
    ).toBe("upcoming");
  });

  it("uses the day after endDate in development after preview", () => {
    vi.stubEnv("NODE_ENV", "development");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "after",
    });

    expect(context.isPreview).toBe(true);
    if (!context.isPreview) {
      return;
    }

    expect(context.todayJapan).toBe("2026-11-19");
    expect(context.forcedPhase).toBe("completed");
    expect(
      getTripPhase(tripDates.startDate, tripDates.endDate, context.todayJapan),
    ).toBe("completed");
  });

  it("uses deterministic 12:00 wall clock for development preview", () => {
    vi.stubEnv("NODE_ENV", "development");

    for (const previewPhase of ["before", "during", "after"] as const) {
      const context = resolveTripHomePreviewContext({
        ...tripDates,
        previewPhase,
      });

      expect(context.isPreview).toBe(true);
      if (!context.isPreview) {
        return;
      }

      expect(context.nowJapanTime).toBe("12:00");
    }
  });

  it("ignores invalid previewPhase values", () => {
    vi.stubEnv("NODE_ENV", "development");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "abc",
    });

    expect(context.isPreview).toBe(false);
  });

  it("ignores previewPhase completely in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "during",
    });

    expect(context.isPreview).toBe(false);
  });

  it("does not mutate trip dates or return side effects", () => {
    vi.stubEnv("NODE_ENV", "development");

    const input = {
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      previewPhase: "during" as const,
    };

    resolveTripHomePreviewContext(input);
    resolveTripHomePreviewContext(input);

    expect(input.startDate).toBe("2026-10-25");
    expect(input.endDate).toBe("2026-11-18");
  });

  it("applies valid previewTime during development during preview", () => {
    vi.stubEnv("NODE_ENV", "development");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "during",
      previewTime: "22:30",
    });

    expect(context.isPreview).toBe(true);
    if (!context.isPreview) {
      return;
    }

    expect(context.nowJapanTime).toBe("22:30");
    expect(context.todayJapan).toBe(tripDates.startDate);
  });

  it("falls back to 12:00 for invalid previewTime", () => {
    vi.stubEnv("NODE_ENV", "development");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "during",
      previewTime: "25:99",
    });

    expect(context.isPreview).toBe(true);
    if (!context.isPreview) {
      return;
    }

    expect(context.nowJapanTime).toBe("12:00");
  });

  it("ignores previewTime outside during preview", () => {
    vi.stubEnv("NODE_ENV", "development");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "before",
      previewTime: "22:30",
    });

    expect(context.isPreview).toBe(true);
    if (!context.isPreview) {
      return;
    }

    expect(context.nowJapanTime).toBe("12:00");
  });

  it("ignores previewTime in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    const context = resolveTripHomePreviewContext({
      ...tripDates,
      previewPhase: "during",
      previewTime: "22:30",
    });

    expect(context.isPreview).toBe(false);
  });

  it("aligns simulated date with prepareTripHomePage phase branching", () => {
    vi.stubEnv("NODE_ENV", "development");

    const cases = [
      { previewPhase: "before", expectedPhase: "upcoming" },
      { previewPhase: "during", expectedPhase: "active" },
      { previewPhase: "after", expectedPhase: "completed" },
    ] as const;

    for (const testCase of cases) {
      const context = resolveTripHomePreviewContext({
        ...tripDates,
        previewPhase: testCase.previewPhase,
      });

      expect(context.isPreview).toBe(true);
      if (!context.isPreview) {
        return;
      }

      const phase = getTripPhase(
        tripDates.startDate,
        tripDates.endDate,
        context.todayJapan,
      );

      expect(phase).toBe(testCase.expectedPhase);
      expect(context.forcedPhase).toBe(testCase.expectedPhase);
    }
  });
});
