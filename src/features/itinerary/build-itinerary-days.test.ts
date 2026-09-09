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

  it("merges transport items into day items without changing activity order", () => {
    const transportsByDate = new Map([
      [
        "2026-10-25",
        [
          {
            id: "t1",
            type: "train" as const,
            typeLabel: "רכבת",
            routeLabel: "Tokyo → Kyoto",
            timeLabel: "08:00 → 10:00",
            departureTime: "08:00",
            detailHref: "/transport/t1",
          },
        ],
      ],
    ]);

    const days = buildItineraryDays({
      startDate: "2026-10-25",
      endDate: "2026-10-25",
      todayJapan: "2026-10-25",
      activities: [
        {
          id: "a",
          date: "2026-10-25",
          title: "מוזיאון",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 0,
          startTime: "10:00",
          timeLabel: "10:00",
        },
      ],
      transportsByDate,
    });

    expect(days[0]?.items.map((item) => item.kind)).toEqual(["transport", "activity"]);
    expect(days[0]?.activities.map((item) => item.id)).toEqual(["a"]);
  });
});

describe("buildItineraryDaysForTrip", () => {
  it("accepts trip date fields", () => {
    const days = buildItineraryDaysForTrip(
      { startDate: "2026-10-25", endDate: "2026-10-26" },
      [],
      new Map(),
      "2026-10-25",
    );

    expect(days).toHaveLength(2);
    expect(days.every((day) => day.activities.length === 0)).toBe(true);
  });
});
