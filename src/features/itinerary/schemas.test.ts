import { describe, expect, it } from "vitest";
import {
  createActivitySchema,
  deleteActivitySchema,
  googleActivityLocationSchema,
  manualActivityLocationSchema,
  parseActivityFieldsFromFormData,
  reorderActivitySchema,
  updateActivitySchema,
} from "./schemas";

const validTripId = "507f1f77bcf86cd799439011";
const validActivityId = "507f191e810c19729de860ea";
const validPlaceId = "ChIJN1t_tDeuEmsRUsoyG83frY4";

describe("createActivitySchema", () => {
  it("accepts minimal valid manual input", () => {
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      title: "מוזיאון",
      type: "attraction",
      date: "2026-10-25",
      placeSource: "manual",
    });
    expect(result.success).toBe(true);
  });

  it("accepts legacy-like manual input without explicit placeSource in parser output", () => {
    const formData = new FormData();
    formData.set("title", "Walk");
    formData.set("type", "freeTime");
    formData.set("date", "2026-10-25");
    formData.set("placeSource", "manual");
    formData.set("locationName", "Park");
    formData.set("address", "");
    const parsed = parseActivityFieldsFromFormData(formData);
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      ...parsed,
    });
    expect(result.success).toBe(true);
  });

  it("accepts google activity snapshot fields", () => {
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      title: "Market",
      type: "shopping",
      date: "2026-10-25",
      placeSource: "google",
      googlePlaceId: validPlaceId,
      locationName: "Nishiki Market",
      latitude: 35.005,
      longitude: 135.765,
      address: "Kyoto",
      city: "Kyoto",
      country: "Japan",
      googleMapsUrl: "https://maps.google.com/?cid=123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects google mode without coordinates", () => {
    const result = googleActivityLocationSchema.safeParse({
      placeSource: "google",
      title: "Market",
      type: "shopping",
      date: "2026-10-25",
      googlePlaceId: validPlaceId,
      locationName: "Nishiki Market",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid latitude and longitude", () => {
    expect(
      googleActivityLocationSchema.safeParse({
        placeSource: "google",
        title: "Market",
        type: "shopping",
        date: "2026-10-25",
        googlePlaceId: validPlaceId,
        locationName: "Nishiki Market",
        latitude: 999,
        longitude: 135.765,
      }).success,
    ).toBe(false);
    expect(
      googleActivityLocationSchema.safeParse({
        placeSource: "google",
        title: "Market",
        type: "shopping",
        date: "2026-10-25",
        googlePlaceId: validPlaceId,
        locationName: "Nishiki Market",
        latitude: 35.005,
        longitude: 999,
      }).success,
    ).toBe(false);
  });

  it("accepts manual mode with optional free-text location", () => {
    const result = manualActivityLocationSchema.safeParse({
      placeSource: "manual",
      title: "Walk",
      type: "freeTime",
      date: "2026-10-25",
      locationName: "Park",
      address: "Near hotel",
    });
    expect(result.success).toBe(true);
  });

  it("trims optional empty strings to undefined", () => {
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      title: "ארוחת צהריים",
      type: "restaurant",
      date: "2026-10-25",
      placeSource: "manual",
      startTime: "",
      endTime: "",
      locationName: "",
      address: "",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startTime).toBeUndefined();
      expect(result.data.endTime).toBeUndefined();
      expect(result.data.locationName).toBeUndefined();
    }
  });

  it("rejects endTime without startTime", () => {
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      title: "פעילות",
      type: "other",
      date: "2026-10-25",
      placeSource: "manual",
      endTime: "10:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects endTime before startTime", () => {
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      title: "פעילות",
      type: "other",
      date: "2026-10-25",
      placeSource: "manual",
      startTime: "12:00",
      endTime: "09:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateActivitySchema", () => {
  it("requires activityId", () => {
    const result = updateActivitySchema.safeParse({
      tripId: validTripId,
      title: "עדכון",
      type: "transport",
      date: "2026-10-26",
      placeSource: "manual",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid update payload", () => {
    const result = updateActivitySchema.safeParse({
      tripId: validTripId,
      activityId: validActivityId,
      title: "רכבת",
      type: "transport",
      date: "2026-10-26",
      placeSource: "manual",
      startTime: "08:00",
      endTime: "09:30",
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteActivitySchema", () => {
  it("accepts trip and activity ids", () => {
    const result = deleteActivitySchema.safeParse({
      tripId: validTripId,
      activityId: validActivityId,
    });
    expect(result.success).toBe(true);
  });
});

describe("reorderActivitySchema", () => {
  it("accepts up and down directions", () => {
    expect(
      reorderActivitySchema.safeParse({
        tripId: validTripId,
        activityId: validActivityId,
        direction: "up",
      }).success,
    ).toBe(true);
    expect(
      reorderActivitySchema.safeParse({
        tripId: validTripId,
        activityId: validActivityId,
        direction: "down",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid direction", () => {
    const result = reorderActivitySchema.safeParse({
      tripId: validTripId,
      activityId: validActivityId,
      direction: "left",
    });
    expect(result.success).toBe(false);
  });
});
