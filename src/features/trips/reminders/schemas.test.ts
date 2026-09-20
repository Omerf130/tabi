import { describe, expect, it } from "vitest";
import {
  createTripReminderSchema,
  tripReminderFieldsSchema,
  updateTripReminderSchema,
} from "./schemas";

describe("trip reminder schemas", () => {
  it("accepts create schema with browser timezone", () => {
    const result = createTripReminderSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      date: "2026-10-25",
      time: "14:30",
      text: "Passport",
      timeZone: "Asia/Jerusalem",
    });

    expect(result.success).toBe(true);
  });

  it("rejects client-supplied scheduledAtUtc on create", () => {
    const result = createTripReminderSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      date: "2026-10-25",
      time: "14:30",
      text: "Passport",
      timeZone: "Asia/Jerusalem",
      scheduledAtUtc: "2026-10-25T11:30:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid reminder fields", () => {
    const result = tripReminderFieldsSchema.safeParse({
      date: "2026-10-25",
      time: "14:30",
      text: "להזמין מונית",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid reminder time", () => {
    const result = tripReminderFieldsSchema.safeParse({
      date: "2026-10-25",
      time: "25:99",
      text: "להזמין מונית",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty reminder text", () => {
    const result = createTripReminderSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      date: "2026-10-25",
      time: "14:30",
      text: "   ",
      timeZone: "Asia/Jerusalem",
    });

    expect(result.success).toBe(false);
  });

  it("accepts update schema with reminder id", () => {
    const result = updateTripReminderSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      reminderId: "507f1f77bcf86cd799439012",
      date: "2026-10-25",
      time: "14:30",
      text: "עודכן",
      timeZone: "Asia/Jerusalem",
    });

    expect(result.success).toBe(true);
  });
});
