import { describe, expect, it } from "vitest";
import { resolveDayLocationCandidates } from "./resolve-day-location-candidates";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TransportItineraryItemViewModel, TransportRecord } from "@/features/transport/types";
const tripId = "trip-1";

const accommodation = (
  overrides: Partial<AccommodationViewModel> = {},
): AccommodationViewModel => ({
  id: "h1",
  tripId,
  placeSource: "manual",
  name: "Hotel Alpha",
  city: "Tokyo",
  checkInDate: "2026-10-25",
  checkOutDate: "2026-10-27",
  checkInLabel: "25 Oct",
  checkOutLabel: "27 Oct",
  dateRangeLabel: "25–27 Oct",
  nightCount: 2,
  usesGoogleAttribution: false,
  ...overrides,
});

const transportRecord = (
  overrides: Partial<TransportRecord> = {},
): TransportRecord => ({
  id: "t1",
  tripId,
  type: "train",
  departure: {
    locationName: "Tokyo",
    date: "2026-10-27",
    time: "09:00",
    timezone: "Asia/Tokyo",
  },
  arrival: {
    locationName: "Kyoto",
    date: "2026-10-27",
    time: "11:00",
    timezone: "Asia/Tokyo",
  },
  details: {},
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("resolveDayLocationCandidates", () => {
  it("prioritizes occupied accommodation city", () => {
    const candidates = resolveDayLocationCandidates({
      date: "2026-10-26",
      accommodations: [accommodation()],
      activities: [
        {
          id: "a1",
          date: "2026-10-26",
          title: "Museum",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 0,
          placeSource: "manual",
          locationName: "Shibuya",
        },
      ],
      dayTransports: [],
      transportRecords: new Map(),
    });

    expect(candidates[0]).toEqual({
      sourceType: "accommodation",
      sourceId: "h1",
      query: "Tokyo, Japan",
    });
  });

  it("falls back to the first located activity", () => {
    const candidates = resolveDayLocationCandidates({
      date: "2026-10-26",
      accommodations: [],
      activities: [
        {
          id: "a1",
          date: "2026-10-26",
          title: "Later",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 1,
          placeSource: "manual",
        },
        {
          id: "a2",
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

    expect(candidates).toEqual([
      {
        sourceType: "activity",
        sourceId: "a2",
        query: "Shibuya Sky",
      },
    ]);
  });

  it("uses arrival endpoint for same-day transport", () => {
    const transportItem: TransportItineraryItemViewModel = {
      id: "t1",
      type: "train",
      typeLabel: "רכבת",
      routeLabel: "Tokyo → Kyoto",
      departureTime: "09:00",
      timeLabel: "09:00–11:00",
      detailHref: "/transport/t1",
    };

    const candidates = resolveDayLocationCandidates({
      date: "2026-10-27",
      accommodations: [],
      activities: [],
      dayTransports: [transportItem],
      transportRecords: new Map([["t1", transportRecord()]]),
    });

    expect(candidates).toEqual([
      {
        sourceType: "transport",
        sourceId: "t1",
        query: "Kyoto",
      },
    ]);
  });

  it("uses departure endpoint when arrival is on a later day", () => {
    const transportItem: TransportItineraryItemViewModel = {
      id: "t1",
      type: "train",
      typeLabel: "רכבת",
      routeLabel: "Tokyo → Kyoto",
      departureTime: "22:00",
      timeLabel: "22:00–06:00",
      detailHref: "/transport/t1",
    };

    const candidates = resolveDayLocationCandidates({
      date: "2026-10-27",
      accommodations: [],
      activities: [],
      dayTransports: [transportItem],
      transportRecords: new Map([
        [
          "t1",
          transportRecord({
            departure: {
              locationName: "Tokyo",
              date: "2026-10-27",
              time: "22:00",
              timezone: "Asia/Tokyo",
            },
            arrival: {
              locationName: "Kyoto",
              date: "2026-10-28",
              time: "06:00",
              timezone: "Asia/Tokyo",
            },
          }),
        ],
      ]),
    });

    expect(candidates[0]?.query).toBe("Tokyo");
  });

  it("uses persisted coordinates for google-backed activities", () => {
    const candidates = resolveDayLocationCandidates({
      date: "2026-10-26",
      accommodations: [],
      activities: [
        {
          id: "a1",
          date: "2026-10-26",
          title: "Nishiki Market",
          type: "shopping",
          typeLabel: "קניות",
          order: 0,
          placeSource: "google",
          googlePlaceId: "ChIJNishiki",
          locationName: "Nishiki Market",
          city: "Kyoto",
          country: "Japan",
          latitude: 35.005,
          longitude: 135.765,
        },
      ],
      dayTransports: [],
      transportRecords: new Map(),
    });

    expect(candidates[0]).toEqual({
      sourceType: "activity",
      sourceId: "a1",
      query: "Nishiki Market",
      coordinates: { latitude: 35.005, longitude: 135.765 },
      country: "Japan",
    });
  });

  it("skips invalid accommodation city values", () => {
    const candidates = resolveDayLocationCandidates({
      date: "2026-10-26",
      accommodations: [accommodation({ city: "—" })],
      activities: [
        {
          id: "a1",
          date: "2026-10-26",
          title: "Museum",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 0,
          placeSource: "manual",
          address: "Ueno Park",
        },
      ],
      dayTransports: [],
      transportRecords: new Map(),
    });

    expect(candidates[0]?.sourceType).toBe("activity");
  });
});
