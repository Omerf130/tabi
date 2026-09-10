import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as searchGET } from "@/app/app/trips/[tripId]/weather/search/route";
import { GET as snapshotGET } from "@/app/app/trips/[tripId]/weather/snapshot/route";

const {
  requireTripMemberMock,
  searchWeatherLocationsWithFallbackMock,
  getWeatherSnapshotMock,
} = vi.hoisted(() => ({
  requireTripMemberMock: vi.fn(),
  searchWeatherLocationsWithFallbackMock: vi.fn(),
  getWeatherSnapshotMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("@/features/weather/weather-search.server", () => ({
  searchWeatherLocationsWithFallback: searchWeatherLocationsWithFallbackMock,
}));

vi.mock("@/features/weather/weatherapi.server", () => ({
  WeatherApiRequestError: class WeatherApiRequestError extends Error {},
}));

vi.mock("@/features/weather/queries", () => ({
  getWeatherSnapshot: getWeatherSnapshotMock,
}));

const tripId = "507f1f77bcf86cd799439011";

describe("weather routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripMemberMock.mockResolvedValue({ id: tripId, role: "member" });
    searchWeatherLocationsWithFallbackMock.mockResolvedValue([
      {
        label: "Tokyo",
        region: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      },
    ]);
    getWeatherSnapshotMock.mockResolvedValue({
      location: {
        label: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      },
      current: {
        temperatureC: 24,
        feelsLikeC: 26,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn.example/icon.png" },
        isDay: true,
      },
      today: {
        date: "2026-09-09",
        minTemperatureC: 20,
        maxTemperatureC: 28,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn.example/icon.png" },
        chanceOfRainPercent: 10,
      },
      forecast: [],
      hourly: [],
      observedAt: "2026-09-09 12:00",
    });
  });

  it("allows members to search locations", async () => {
    const response = await searchGET(
      new Request(`http://localhost/app/trips/${tripId}/weather/search?q=tokyo`),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({ label: "Tokyo", latitude: 35.6895 }),
    ]);
  });

  it("returns Hebrew fallback results from the search route", async () => {
    searchWeatherLocationsWithFallbackMock.mockResolvedValue([
      {
        label: "חיפה",
        region: "Haifa",
        country: "Israel",
        latitude: 32.794,
        longitude: 34.9896,
      },
    ]);

    const response = await searchGET(
      new Request(`http://localhost/app/trips/${tripId}/weather/search?q=${encodeURIComponent("חיפה")}`),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({ label: "חיפה", latitude: 32.794 }),
    ]);
  });

  it("rejects short search queries", async () => {
    const response = await searchGET(
      new Request(`http://localhost/app/trips/${tripId}/weather/search?q=to`),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(400);
  });

  it("loads snapshots from validated coordinates without provider IDs", async () => {
    const response = await snapshotGET(
      new Request(
        `http://localhost/app/trips/${tripId}/weather/snapshot?latitude=35.6895&longitude=139.6917&label=Tokyo&country=Japan`,
      ),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(200);
    expect(getWeatherSnapshotMock).toHaveBeenCalledWith({
      label: "Tokyo",
      region: undefined,
      country: "Japan",
      latitude: 35.6895,
      longitude: 139.6917,
    });
  });

  it("loads WeatherAPI snapshot for Google-fallback coordinates", async () => {
    const response = await snapshotGET(
      new Request(
        `http://localhost/app/trips/${tripId}/weather/snapshot?latitude=32.794&longitude=34.9896&label=${encodeURIComponent("חיפה")}&country=Israel&region=Haifa`,
      ),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(200);
    expect(getWeatherSnapshotMock).toHaveBeenCalledWith({
      label: "חיפה",
      region: "Haifa",
      country: "Israel",
      latitude: 32.794,
      longitude: 34.9896,
    });
  });

  it("rejects invalid coordinates", async () => {
    const response = await snapshotGET(
      new Request(
        `http://localhost/app/trips/${tripId}/weather/snapshot?latitude=999&longitude=0`,
      ),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(400);
  });
});
