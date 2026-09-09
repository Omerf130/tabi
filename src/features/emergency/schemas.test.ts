import { describe, expect, it } from "vitest";
import {
  createTripEmergencyResourceSchema,
  updateTripEmergencyResourceSchema,
} from "./schemas";

const tripId = "507f1f77bcf86cd799439011";
const resourceId = "507f1f77bcf86cd799439012";

describe("trip emergency resource schemas", () => {
  it("accepts a valid resource with phone", () => {
    const parsed = createTripEmergencyResourceSchema.safeParse({
      tripId,
      category: "insurance",
      title: "הראל ביטוח נסיעות",
      phone: "03-1234567",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects empty information payload", () => {
    const parsed = createTripEmergencyResourceSchema.safeParse({
      tripId,
      category: "other",
      title: "רק כותרת",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email and url", () => {
    expect(
      createTripEmergencyResourceSchema.safeParse({
        tripId,
        category: "other",
        title: "בדיקה",
        email: "not-an-email",
      }).success,
    ).toBe(false);

    expect(
      createTripEmergencyResourceSchema.safeParse({
        tripId,
        category: "other",
        title: "בדיקה",
        url: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("validates update schema", () => {
    const parsed = updateTripEmergencyResourceSchema.safeParse({
      tripId,
      resourceId,
      category: "medical",
      title: "מרפאה",
      notes: "פתוח 24/7",
    });

    expect(parsed.success).toBe(true);
  });
});
