import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeTripReminderAction,
  createTripReminderAction,
  deleteTripReminderAction,
} from "./actions";

const {
  requireUserMock,
  requireTripMemberMock,
  createTripReminderMock,
  completeTripReminderMock,
  deleteTripReminderMock,
  getReminderForUserMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  requireTripMemberMock: vi.fn(),
  createTripReminderMock: vi.fn(),
  completeTripReminderMock: vi.fn(),
  deleteTripReminderMock: vi.fn(),
  getReminderForUserMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("./reminder-domain", () => ({
  createTripReminder: createTripReminderMock,
  updateTripReminder: vi.fn(),
  completeTripReminder: completeTripReminderMock,
  deleteTripReminder: deleteTripReminderMock,
  TripReminderValidationError: class TripReminderValidationError extends Error {},
  TripReminderNotFoundError: class TripReminderNotFoundError extends Error {
    constructor() {
      super("not found");
    }
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/trip-management/revalidation", () => ({
  revalidateTripManagement: vi.fn(),
}));

vi.mock("@/features/itinerary/revalidation", () => ({
  revalidateItineraryPaths: vi.fn(),
}));

vi.mock("./queries", () => ({
  getReminderForUser: getReminderForUserMock,
}));

describe("trip reminder actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    requireTripMemberMock.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      startDate: "2026-10-25",
      endDate: "2026-11-18",
    });
    createTripReminderMock.mockResolvedValue("reminder-1");
    completeTripReminderMock.mockResolvedValue(undefined);
    deleteTripReminderMock.mockResolvedValue(undefined);
    getReminderForUserMock.mockResolvedValue({
      _id: { toString: () => "507f1f77bcf86cd799439012" },
      date: "2026-10-25",
      time: "14:30",
      text: "Reminder",
      isCompleted: false,
    });
  });

  it("creates a reminder for the current user", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("date", "2026-10-25");
    formData.set("time", "14:30");
    formData.set("text", "להזמין מונית");

    const result = await createTripReminderAction({}, formData);

    expect(result.ok).toBe(true);
    expect(createTripReminderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        date: "2026-10-25",
      }),
    );
  });

  it("scopes completion to the current user", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("reminderId", "507f1f77bcf86cd799439012");

    const result = await completeTripReminderAction({}, formData);

    expect(result.ok).toBe(true);
    expect(completeTripReminderMock).toHaveBeenCalledWith({
      tripId: "507f1f77bcf86cd799439011",
      userId: "user-1",
      reminderId: "507f1f77bcf86cd799439012",
    });
  });

  it("scopes deletion to the current user", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("reminderId", "507f1f77bcf86cd799439012");

    const result = await deleteTripReminderAction({}, formData);

    expect(result.ok).toBe(true);
    expect(deleteTripReminderMock).toHaveBeenCalledWith({
      tripId: "507f1f77bcf86cd799439011",
      userId: "user-1",
      reminderId: "507f1f77bcf86cd799439012",
    });
  });
});
