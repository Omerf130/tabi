import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFocusedDayCard } from "./build-focused-day-card.server";

const { resolveDayLocationMock, getWeatherSnapshotMock } = vi.hoisted(() => ({
  resolveDayLocationMock: vi.fn(),
  getWeatherSnapshotMock: vi.fn(),
}));

vi.mock("./resolve-day-location.server", () => ({
  resolveDayLocation: resolveDayLocationMock,
}));

vi.mock("@/features/weather/queries", () => ({
  getWeatherSnapshot: getWeatherSnapshotMock,
}));

vi.mock("@/features/trips/japan-wall-clock", () => ({
  getJapanWallClockTime: () => "10:00",
}));

const baseInput = {
  tripId: "trip-1",
  focusedDate: "2026-10-26",
  startDate: "2026-10-25",
  endDate: "2026-10-30",
  activities: [
    {
      id: "a1",
      date: "2026-10-26",
      title: "Shibuya Sky",
      type: "attraction" as const,
      typeLabel: "אטרקציה",
      order: 0,
      placeSource: "manual" as const,
      startTime: "14:00",
    },
  ],
  dayTransports: [
    {
      id: "t1",
      type: "train" as const,
      typeLabel: "רכבת",
      routeLabel: "Tokyo → Kyoto",
      departureTime: "09:00",
      timeLabel: "09:00–11:00",
      detailHref: "/transport/t1",
    },
  ],
  transportRecords: new Map(),
  accommodations: [
    {
      id: "h1",
      tripId: "trip-1",
      placeSource: "manual" as const,
      name: "Hotel Gracery Shinjuku",
      city: "Tokyo",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-28",
      checkInLabel: "25 Oct",
      checkOutLabel: "28 Oct",
      dateRangeLabel: "25–28 Oct",
      nightCount: 3,
      usesGoogleAttribution: false,
    },
  ],
  incompleteReminderCount: 2,
  todayJapan: "2026-10-26",
};

describe("buildFocusedDayCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveDayLocationMock.mockResolvedValue({
      label: "Tokyo",
      country: "Japan",
      latitude: 35.6895,
      longitude: 139.6917,
      sourceType: "accommodation",
      sourceId: "h1",
    });
    getWeatherSnapshotMock.mockResolvedValue({
      location: {
        label: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      },
      current: {
        temperatureC: 20,
        feelsLikeC: 19,
        isDay: true,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
      },
      today: {
        date: "2026-10-26",
        minTemperatureC: 15,
        maxTemperatureC: 22,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
        chanceOfRainPercent: 10,
      },
      forecast: [],
      observedAt: "2026-10-26 09:00",
    });
  });

  it("builds an active-day card with weather, accommodation, and indicators", async () => {
    const card = await buildFocusedDayCard(baseInput);

    expect(card.showTodayBadge).toBe(true);
    expect(card.weather).toEqual({
      temperatureLabel: "20°",
      conditionIconUrl: "https://cdn/icon.png",
      conditionLabel: "בהיר",
      locationLabel: "Tokyo",
    });
    expect(card.accommodationName).toBe("Hotel Gracery Shinjuku");
    expect(card.transportCount).toBe(1);
    expect(card.incompleteReminderCount).toBe(2);
    expect(card.href).toBe("/app/trips/trip-1/itinerary/2026-10-26");
  });

  it("omits weather when focused date is outside the snapshot window", async () => {
    getWeatherSnapshotMock.mockResolvedValue({
      location: {
        label: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      },
      current: {
        temperatureC: 20,
        feelsLikeC: 19,
        isDay: true,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
      },
      today: {
        date: "2026-10-20",
        minTemperatureC: 15,
        maxTemperatureC: 22,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
        chanceOfRainPercent: 10,
      },
      forecast: [],
      observedAt: "2026-10-20 09:00",
    });

    const card = await buildFocusedDayCard(baseInput);

    expect(card.weather).toBeUndefined();
  });

  it("omits weather when location resolution fails", async () => {
    resolveDayLocationMock.mockResolvedValue(null);

    const card = await buildFocusedDayCard(baseInput);

    expect(card.weather).toBeUndefined();
    expect(getWeatherSnapshotMock).not.toHaveBeenCalled();
  });

  it("does not show today badge before the trip", async () => {
    const card = await buildFocusedDayCard({
      ...baseInput,
      focusedDate: "2026-10-25",
      todayJapan: "2026-10-20",
    });

    expect(card.showTodayBadge).toBe(false);
    expect(card.nextItems.length).toBeGreaterThan(0);
  });
});
