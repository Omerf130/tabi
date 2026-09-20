import { describe, expect, it } from "vitest";
import { buildTripReminderPushWirePayload } from "./build-trip-reminder-push-payload";

describe("buildTripReminderPushWirePayload", () => {
  it("builds minimal privacy-safe payload", () => {
    const payload = buildTripReminderPushWirePayload({
      tripId: "507f1f77bcf86cd799439011",
      reminderId: "507f1f77bcf86cd799439012",
      body: "You have a trip reminder",
    });

    expect(payload).toEqual({
      title: "Tabi",
      body: "You have a trip reminder",
      url: "/app/trips/507f1f77bcf86cd799439011",
      tag: "reminder-507f1f77bcf86cd799439012",
    });
    expect(JSON.stringify(payload)).not.toContain("Passport");
  });
});
