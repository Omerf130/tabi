import { describe, expect, it } from "vitest";
import {
  buildItineraryDays,
  buildItineraryDaysForTrip,
} from "./build-itinerary-days";

describe("buildItineraryDays", () => {
  it("builds 25 sequential days for the Japan validation range", () => {
    const days = buildItineraryDays({
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      todayJapan: "2026-10-25",
    });

    expect(days).toHaveLength(25);
    expect(days[0]?.date).toBe("2026-10-25");
    expect(days[0]?.dayNumber).toBe(1);
    expect(days[24]?.date).toBe("2026-11-18");
    expect(days[24]?.dayNumber).toBe(25);
  });

  it("marks temporal states relative to todayJapan", () => {
    const days = buildItineraryDays({
      startDate: "2026-10-25",
      endDate: "2026-10-27",
      todayJapan: "2026-10-26",
    });

    expect(days[0]?.temporalState).toBe("past");
    expect(days[1]?.temporalState).toBe("today");
    expect(days[2]?.temporalState).toBe("future");
  });

  it("populates display labels", () => {
    const days = buildItineraryDays({
      startDate: "2026-10-25",
      endDate: "2026-10-25",
      todayJapan: "2026-10-25",
    });

    expect(days[0]?.weekdayLabel.length).toBeGreaterThan(0);
    expect(days[0]?.dateLabel).toContain("25");
    expect(days[0]?.headingLabel).toContain(days[0]!.weekdayLabel);
    expect(days[0]?.activities).toEqual([]);
  });

  it("attaches grouped activities to each day", () => {
    const days = buildItineraryDays({
      startDate: "2026-10-25",
      endDate: "2026-10-26",
      todayJapan: "2026-10-25",
      activities: [
        {
          id: "a",
          date: "2026-10-25",
          title: "מוזיאון",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 0,
        },
        {
          id: "b",
          date: "2026-10-26",
          title: "רכבת",
          type: "transport",
          typeLabel: "תחבורה",
          order: 0,
        },
      ],
    });

    expect(days[0]?.activities.map((item) => item.id)).toEqual(["a"]);
    expect(days[1]?.activities.map((item) => item.id)).toEqual(["b"]);
  });
});

describe("buildItineraryDaysForTrip", () => {
  it("accepts trip date fields", () => {
    const days = buildItineraryDaysForTrip(
      { startDate: "2026-10-25", endDate: "2026-10-26" },
      [],
      "2026-10-25",
    );

    expect(days).toHaveLength(2);
    expect(days.every((day) => day.activities.length === 0)).toBe(true);
  });
});
