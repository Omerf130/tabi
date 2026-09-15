import { beforeEach, describe, expect, it, vi } from "vitest";
import { computeTripDateChangeImpact } from "./compute-trip-date-change-impact";
import { previewTripDateChangeSchema } from "@/features/trips/schemas";
import { TRIP_DATE_CHANGE_ERROR_CODES } from "./constants";
import { createSignedPayloadToken, verifySignedPayloadToken } from "@/lib/crypto/signed-payload";

process.env.TABI_PREVIEW_TOKEN_SECRET = "test-preview-secret";

const {
  activityFindMock,
  accommodationFindMock,
  transportFindMock,
  reminderFindMock,
  expenseFindMock,
} = vi.hoisted(() => ({
  activityFindMock: vi.fn(),
  accommodationFindMock: vi.fn(),
  transportFindMock: vi.fn(),
  reminderFindMock: vi.fn(),
  expenseFindMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/Activity", () => ({
  Activity: { find: activityFindMock },
}));

vi.mock("@/models/Accommodation", () => ({
  Accommodation: { find: accommodationFindMock },
}));

vi.mock("@/models/Transport", () => ({
  Transport: { find: transportFindMock },
}));

vi.mock("@/models/TripReminder", () => ({
  TripReminder: { find: reminderFindMock },
}));

vi.mock("@/models/TripExpense", () => ({
  TripExpense: { find: expenseFindMock },
}));

function leanResolve<T>(value: T[]) {
  return { select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }) };
}

describe("trip date change impact engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activityFindMock.mockReturnValue(leanResolve([]));
    accommodationFindMock.mockReturnValue(leanResolve([]));
    transportFindMock.mockReturnValue(leanResolve([]));
    reminderFindMock.mockReturnValue(leanResolve([]));
    expenseFindMock.mockReturnValue(leanResolve([]));
  });

  it("marks out-of-range activities for deletion", async () => {
    activityFindMock.mockReturnValue(
      leanResolve([
        {
          _id: { toString: () => "a1" },
          title: "Morning tour",
          date: "2026-10-31",
        },
        {
          _id: { toString: () => "a2" },
          title: "Dinner",
          date: "2026-11-05",
        },
      ]),
    );

    const impact = await computeTripDateChangeImpact({
      tripId: "507f1f77bcf86cd799439011",
      oldStartDate: "2026-10-25",
      oldEndDate: "2026-11-18",
      newStartDate: "2026-11-01",
      newEndDate: "2026-11-18",
    });

    expect(impact.activitiesToDelete.map((item) => item.id)).toEqual(["a1"]);
    expect(impact.requiresConfirmation).toBe(true);
  });

  it("flags transport with departure outside the new trip range without deleting", async () => {
    transportFindMock.mockReturnValue(
      leanResolve([
        {
          _id: { toString: () => "t1" },
          type: "flight",
          departure: { locationName: "Narita", date: "2026-10-30" },
        },
      ]),
    );

    const impact = await computeTripDateChangeImpact({
      tripId: "507f1f77bcf86cd799439011",
      oldStartDate: "2026-10-25",
      oldEndDate: "2026-11-18",
      newStartDate: "2026-11-01",
      newEndDate: "2026-11-18",
    });

    expect(impact.transportsToReview).toHaveLength(1);
    expect(impact.activitiesToDelete).toHaveLength(0);
  });

  it("has no confirmation requirement for pure expansion with no affected entities", async () => {
    const impact = await computeTripDateChangeImpact({
      tripId: "507f1f77bcf86cd799439011",
      oldStartDate: "2026-11-01",
      oldEndDate: "2026-11-18",
      newStartDate: "2026-10-25",
      newEndDate: "2026-11-20",
    });

    expect(impact.requiresConfirmation).toBe(false);
  });
});

describe("trip date change schemas and tokens", () => {
  it("rejects invalid date ranges using canonical trip date rules", () => {
    const parsed = previewTripDateChangeSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      startDate: "2026-11-18",
      endDate: "2026-11-01",
    });
    expect(parsed.success).toBe(false);
  });

  it("signs and verifies preview tokens", () => {
    const token = createSignedPayloadToken({
      v: 1,
      tripId: "507f1f77bcf86cd799439011",
      tripUpdatedAt: "2026-01-01T00:00:00.000Z",
      newStartDate: "2026-11-01",
      newEndDate: "2026-11-18",
      impactHash: "abc",
    });

    expect(verifySignedPayloadToken(token)?.impactHash).toBe("abc");
    expect(verifySignedPayloadToken(`${token}x`)).toBeNull();
  });

  it("exposes stable no-change and stale error codes", () => {
    expect(TRIP_DATE_CHANGE_ERROR_CODES.noChange).toBe("noChange");
    expect(TRIP_DATE_CHANGE_ERROR_CODES.stalePreview).toBe("stalePreview");
  });
});
