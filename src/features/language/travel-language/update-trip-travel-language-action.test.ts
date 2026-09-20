import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TRIP_TRAVEL_LANGUAGE_ERROR_CODES,
  updateTripTravelLanguageAction,
} from "./update-trip-travel-language-action";

const tripId = "507f1f77bcf86cd799439011";

const { requireTripOwnerMock, findByIdAndUpdateMock, revalidateMock } = vi.hoisted(() => ({
  requireTripOwnerMock: vi.fn(),
  findByIdAndUpdateMock: vi.fn(),
  revalidateMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/Trip", () => ({
  Trip: {
    findByIdAndUpdate: findByIdAndUpdateMock,
  },
}));

vi.mock("./revalidate-trip-travel-language", () => ({
  revalidateTripTravelLanguageSurfaces: revalidateMock,
}));

describe("updateTripTravelLanguageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: tripId, role: "owner" });
    findByIdAndUpdateMock.mockResolvedValue({ id: tripId });
  });

  it("clears travelLanguageCode when automatic is selected", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("selectionMode", "automatic");

    const result = await updateTripTravelLanguageAction({}, formData);

    expect(result.ok).toBe(true);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      tripId,
      { $set: { travelLanguageCode: null } },
      { runValidators: true },
    );
    expect(revalidateMock).toHaveBeenCalledWith(tripId);
  });

  it("allows owner to set supported override", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("selectionMode", "manual");
    formData.set("travelLanguageCode", "es");

    const result = await updateTripTravelLanguageAction({}, formData);

    expect(result.ok).toBe(true);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      tripId,
      { $set: { travelLanguageCode: "es" } },
      { runValidators: true },
    );
  });

  it("rejects member updates", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("forbidden"));

    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("selectionMode", "manual");
    formData.set("travelLanguageCode", "es");

    const result = await updateTripTravelLanguageAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(result.errorCode).toBe(TRIP_TRAVEL_LANGUAGE_ERROR_CODES.forbidden);
    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects invalid language", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("selectionMode", "manual");
    formData.set("travelLanguageCode", "xx-fake");

    const result = await updateTripTravelLanguageAction({}, formData);

    expect(result.errorCode).toBe(TRIP_TRAVEL_LANGUAGE_ERROR_CODES.validationFailed);
    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
  });
});
