import { describe, expect, it } from "vitest";
import {
  googleAccommodationFieldsSchema,
  manualAccommodationFieldsSchema,
  createAccommodationSchema,
} from "./schemas";

describe("accommodation schemas", () => {
  it("accepts google source with place id and trip fields only", () => {
    const result = googleAccommodationFieldsSchema.safeParse({
      placeSource: "google",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-28",
      bookingReference: "ABC123",
      notes: "Late check-in",
    });

    expect(result.success).toBe(true);
  });

  it("accepts manual source with manual identity fields", () => {
    const result = manualAccommodationFieldsSchema.safeParse({
      placeSource: "manual",
      manualName: "Hotel Gracery Shinjuku",
      manualNameJapanese: "ホテルグレイスリー新宿",
      manualCity: "Tokyo",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-28",
      manualAddressEnglish: "1-19-1 Kabukicho",
      manualGoogleMapsUrl: "https://maps.google.com/example",
    });

    expect(result.success).toBe(true);
  });

  it("rejects google source without googlePlaceId", () => {
    const result = googleAccommodationFieldsSchema.safeParse({
      placeSource: "google",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-28",
    });

    expect(result.success).toBe(false);
  });

  it("rejects manual source without manualName", () => {
    const result = manualAccommodationFieldsSchema.safeParse({
      placeSource: "manual",
      manualCity: "Tokyo",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-26",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid manual google maps url", () => {
    const result = manualAccommodationFieldsSchema.safeParse({
      placeSource: "manual",
      manualName: "Hotel",
      manualCity: "Tokyo",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-26",
      manualGoogleMapsUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });

  it("accepts create schema with google source", () => {
    const result = createAccommodationSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      placeSource: "google",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-28",
    });

    expect(result.success).toBe(true);
  });
});
