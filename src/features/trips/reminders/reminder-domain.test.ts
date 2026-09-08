import { describe, expect, it, vi } from "vitest";
import { TripReminderValidationError, createTripReminder } from "./reminder-domain";

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TripReminder", () => ({
  TripReminder: {
    create: vi.fn(),
  },
}));

describe("createTripReminder validation", () => {
  it("rejects reminder dates outside the trip range", async () => {
    await expect(
      createTripReminder({
        tripId: "507f1f77bcf86cd799439011",
        userId: "user-1",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
        date: "2026-12-01",
        time: "14:30",
        text: "מחוץ לטווח",
      }),
    ).rejects.toBeInstanceOf(TripReminderValidationError);
  });
});
