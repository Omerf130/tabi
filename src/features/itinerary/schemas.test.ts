import { describe, expect, it } from "vitest";
import {
  createActivitySchema,
  deleteActivitySchema,
  reorderActivitySchema,
  updateActivitySchema,
} from "./schemas";

const validTripId = "507f1f77bcf86cd799439011";
const validActivityId = "507f191e810c19729de860ea";

describe("createActivitySchema", () => {
  it("accepts minimal valid input", () => {
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      title: "מוזיאון",
      type: "attraction",
      date: "2026-10-25",
    });
    expect(result.success).toBe(true);
  });

  it("trims optional empty strings to undefined", () => {
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      title: "ארוחת צהריים",
      type: "restaurant",
      date: "2026-10-25",
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
