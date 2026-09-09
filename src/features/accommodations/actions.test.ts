import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAccommodationAction,
  deleteAccommodationAction,
  updateAccommodationAction,
} from "./actions";

const { requireTripOwnerMock, createAccommodationMock, updateAccommodationMock, deleteAccommodationMock } =
  vi.hoisted(() => ({
    requireTripOwnerMock: vi.fn(),
    createAccommodationMock: vi.fn(),
    updateAccommodationMock: vi.fn(),
    deleteAccommodationMock: vi.fn(),
  }));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("./accommodation-domain", () => ({
  createAccommodation: createAccommodationMock,
  updateAccommodation: updateAccommodationMock,
  deleteAccommodation: deleteAccommodationMock,
  AccommodationValidationError: class AccommodationValidationError extends Error {},
  AccommodationNotFoundError: class AccommodationNotFoundError extends Error {
    constructor() {
      super("not found");
    }
  },
}));

const { revalidatePathMock } = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

describe("accommodation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      startDate: "2026-10-25",
      endDate: "2026-11-18",
    });
    createAccommodationMock.mockResolvedValue("acc-1");
    updateAccommodationMock.mockResolvedValue(undefined);
    deleteAccommodationMock.mockResolvedValue(undefined);
  });

  it("creates google-backed accommodation without resolving place again", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("placeSource", "google");
    formData.set("googlePlaceId", "ChIJN1t_tDeuEmsRUsoyG83frY4");
    formData.set("checkInDate", "2026-10-25");
    formData.set("checkOutDate", "2026-10-28");

    const result = await createAccommodationAction({}, formData);

    expect(result.ok).toBe(true);
    expect(createAccommodationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.objectContaining({
          placeSource: "google",
          googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        }),
      }),
    );
  });

  it("creates manual accommodation", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("placeSource", "manual");
    formData.set("manualName", "Guesthouse");
    formData.set("manualCity", "Kyoto");
    formData.set("checkInDate", "2026-10-25");
    formData.set("checkOutDate", "2026-10-26");

    const result = await createAccommodationAction({}, formData);

    expect(result.ok).toBe(true);
    expect(createAccommodationMock).toHaveBeenCalled();
  });

  it("updates google-backed accommodation with trip fields only", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("accommodationId", "507f1f77bcf86cd799439012");
    formData.set("placeSource", "google");
    formData.set("googlePlaceId", "ChIJN1t_tDeuEmsRUsoyG83frY4");
    formData.set("checkInDate", "2026-10-26");
    formData.set("checkOutDate", "2026-10-29");
    formData.set("notes", "Updated notes");

    const result = await updateAccommodationAction({}, formData);

    expect(result.ok).toBe(true);
    expect(updateAccommodationMock).toHaveBeenCalled();
  });

  it("rejects member via owner authorization", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("forbidden"));
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("placeSource", "manual");
    formData.set("manualName", "Hotel");
    formData.set("manualCity", "Tokyo");
    formData.set("checkInDate", "2026-10-25");
    formData.set("checkOutDate", "2026-10-26");

    const result = await createAccommodationAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(createAccommodationMock).not.toHaveBeenCalled();
  });

  it("allows owner deletion", async () => {
    const tripId = "507f1f77bcf86cd799439011";
    const accommodationId = "507f1f77bcf86cd799439012";
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("accommodationId", accommodationId);

    const result = await deleteAccommodationAction({}, formData);

    expect(result.ok).toBe(true);
    expect(deleteAccommodationMock).toHaveBeenCalledWith({
      tripId,
      accommodationId,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(`/app/trips/${tripId}/accommodations`);
    expect(revalidatePathMock).toHaveBeenCalledWith(`/app/trips/${tripId}/settings`);
    expect(revalidatePathMock).toHaveBeenCalledWith(`/app/trips/${tripId}/more`);
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/app/trips/${tripId}/accommodations/${accommodationId}`,
    );
  });

  it("rejects member deletion via owner authorization", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("forbidden"));
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("accommodationId", "507f1f77bcf86cd799439012");

    const result = await deleteAccommodationAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(deleteAccommodationMock).not.toHaveBeenCalled();
  });
});
