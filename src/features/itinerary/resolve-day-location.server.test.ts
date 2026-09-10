import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveDayLocation } from "./resolve-day-location.server";

const { searchWeatherLocationsMock } = vi.hoisted(() => ({
  searchWeatherLocationsMock: vi.fn(),
}));

vi.mock("@/features/weather/weatherapi.server", () => ({
  searchWeatherLocations: searchWeatherLocationsMock,
}));

vi.mock("@/features/weather/weather-search.server", () => ({
  searchWeatherLocationsWithFallback: vi.fn(),
}));

vi.mock("@/features/places/googlePlaces.server", () => ({
  fetchPlaceGeographyDetails: vi.fn(),
}));

describe("resolveDayLocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the first WeatherAPI result for accommodation city", async () => {
    searchWeatherLocationsMock.mockResolvedValueOnce([
      {
        label: "Tokyo",
        region: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      },
    ]);

    const result = await resolveDayLocation({
      date: "2026-10-26",
      accommodations: [
        {
          id: "h1",
          tripId: "trip-1",
          placeSource: "google",
          googlePlaceId: "place-1",
          name: "Hotel Gracery",
          city: "Tokyo",
          checkInDate: "2026-10-25",
          checkOutDate: "2026-10-28",
          checkInLabel: "25 Oct",
          checkOutLabel: "28 Oct",
          dateRangeLabel: "25–28 Oct",
          nightCount: 3,
          usesGoogleAttribution: true,
        },
      ],
      activities: [],
      dayTransports: [],
      transportRecords: new Map(),
    });

    expect(result).toMatchObject({
      label: "Tokyo",
      sourceType: "accommodation",
      sourceId: "h1",
    });
    expect(searchWeatherLocationsMock).toHaveBeenCalledWith("Tokyo, Japan");
    expect(searchWeatherLocationsMock).toHaveBeenCalledTimes(1);
  });

  it("continues to activity when accommodation search fails", async () => {
    searchWeatherLocationsMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          label: "Shibuya",
          country: "Japan",
          latitude: 35.66,
          longitude: 139.7,
        },
      ]);

    const result = await resolveDayLocation({
      date: "2026-10-26",
      accommodations: [
        {
          id: "h1",
          tripId: "trip-1",
          placeSource: "manual",
          name: "Hotel",
          city: "Unknownville",
          checkInDate: "2026-10-25",
          checkOutDate: "2026-10-28",
          checkInLabel: "25 Oct",
          checkOutLabel: "28 Oct",
          dateRangeLabel: "25–28 Oct",
          nightCount: 3,
          usesGoogleAttribution: false,
        },
      ],
      activities: [
        {
          id: "a1",
          date: "2026-10-26",
          title: "Shibuya Sky",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 0,
          placeSource: "manual",
          locationName: "Shibuya Sky",
        },
      ],
      dayTransports: [],
      transportRecords: new Map(),
    });

    expect(result?.sourceType).toBe("activity");
    expect(searchWeatherLocationsMock).toHaveBeenCalledTimes(2);
  });

  it("returns null when no candidate resolves", async () => {
    searchWeatherLocationsMock.mockResolvedValue([]);

    const result = await resolveDayLocation({
      date: "2026-10-26",
      accommodations: [],
      activities: [],
      dayTransports: [],
      transportRecords: new Map(),
    });

    expect(result).toBeNull();
  });
});
