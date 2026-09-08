import { describe, expect, it, vi } from "vitest";
import {
  AccommodationValidationError,
  assertAccommodationDateRange,
  compareAccommodations,
  createAccommodation,
  isAccommodationOccupiedOnDate,
} from "./accommodation-domain";

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/Accommodation", () => ({
  Accommodation: {
    create: vi.fn(),
  },
}));

describe("isAccommodationOccupiedOnDate", () => {
  const checkIn = "2026-10-25";
  const checkOut = "2026-10-28";

  it("includes check-in date", () => {
    expect(isAccommodationOccupiedOnDate(checkIn, checkOut, "2026-10-25")).toBe(
      true,
    );
  });

  it("includes intermediate nights", () => {
    expect(isAccommodationOccupiedOnDate(checkIn, checkOut, "2026-10-26")).toBe(
      true,
    );
    expect(isAccommodationOccupiedOnDate(checkIn, checkOut, "2026-10-27")).toBe(
      true,
    );
  });

  it("excludes check-out date", () => {
    expect(isAccommodationOccupiedOnDate(checkIn, checkOut, "2026-10-28")).toBe(
      false,
    );
  });

  it("excludes dates before check-in", () => {
    expect(isAccommodationOccupiedOnDate(checkIn, checkOut, "2026-10-24")).toBe(
      false,
    );
  });

  it("excludes dates after check-out", () => {
    expect(isAccommodationOccupiedOnDate(checkIn, checkOut, "2026-10-29")).toBe(
      false,
    );
  });
});

describe("assertAccommodationDateRange", () => {
  const startDate = "2026-10-25";
  const endDate = "2026-11-18";

  it("requires check-out after check-in", () => {
    expect(() =>
      assertAccommodationDateRange("2026-10-25", "2026-10-25", startDate, endDate),
    ).toThrow(AccommodationValidationError);

    expect(() =>
      assertAccommodationDateRange("2026-10-28", "2026-10-25", startDate, endDate),
    ).toThrow(AccommodationValidationError);
  });

  it("requires both dates within trip range", () => {
    expect(() =>
      assertAccommodationDateRange("2026-10-20", "2026-10-26", startDate, endDate),
    ).toThrow(AccommodationValidationError);

    expect(() =>
      assertAccommodationDateRange("2026-11-15", "2026-11-20", startDate, endDate),
    ).toThrow(AccommodationValidationError);
  });

  it("accepts valid one-night stay within trip", () => {
    expect(() =>
      assertAccommodationDateRange("2026-10-25", "2026-10-26", startDate, endDate),
    ).not.toThrow();
  });
});

describe("createAccommodation validation", () => {
  it("rejects dates outside the trip range", async () => {
    await expect(
      createAccommodation({
        tripId: "507f1f77bcf86cd799439011",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
        fields: {
          placeSource: "manual",
          manualName: "Hotel",
          manualCity: "Tokyo",
          checkInDate: "2026-12-01",
          checkOutDate: "2026-12-03",
          manualNameJapanese: undefined,
          manualAddressEnglish: undefined,
          manualAddressJapanese: undefined,
          manualGoogleMapsUrl: undefined,
          bookingReference: undefined,
          notes: undefined,
        },
      }),
    ).rejects.toBeInstanceOf(AccommodationValidationError);
  });
});

describe("compareAccommodations", () => {
  it("sorts by check-in date then id", () => {
    const items = [
      { id: "b", checkInDate: "2026-10-28" },
      { id: "a", checkInDate: "2026-10-25" },
      { id: "c", checkInDate: "2026-10-25" },
    ];

    const sorted = [...items].sort(compareAccommodations);
    expect(sorted.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });
});
