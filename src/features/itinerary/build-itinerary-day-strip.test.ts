import { describe, expect, it } from "vitest";
import {
  buildItineraryDayStrip,
  formatTripDayStripDateLabel,
} from "./build-itinerary-day-strip";

describe("buildItineraryDayStrip", () => {
  it("derives all trip dates without wrapping grid semantics", () => {
    const days = buildItineraryDayStrip({
      tripId: "trip-1",
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      selectedDate: "2026-10-30",
      todayJapan: "2026-10-26",
    });

    expect(days).toHaveLength(25);
    expect(days[0]).toMatchObject({
      date: "2026-10-25",
      dayNumber: 1,
      shortDateLabel: "25/10",
      isSelected: false,
      isToday: false,
    });
    expect(days[5]).toMatchObject({
      date: "2026-10-30",
      dayNumber: 6,
      isSelected: true,
    });
    expect(days.every((day) => day.href.includes("/itinerary/"))).toBe(true);
  });

  it("marks today in the strip", () => {
    const days = buildItineraryDayStrip({
      tripId: "trip-1",
      startDate: "2026-10-25",
      endDate: "2026-10-27",
      selectedDate: "2026-10-26",
      todayJapan: "2026-10-26",
    });

    expect(days.find((day) => day.date === "2026-10-26")?.isToday).toBe(true);
  });
});

describe("formatTripDayStripDateLabel", () => {
  it("formats DD/MM labels for the strip", () => {
    expect(formatTripDayStripDateLabel("2026-10-27")).toBe("27/10");
  });
});
