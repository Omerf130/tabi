import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getActivityPhoto } from "@/app/app/trips/[tripId]/activities/[activityId]/photo/route";
import { GET as getAccommodationPhoto } from "@/app/app/trips/[tripId]/accommodations/[accommodationId]/photo/route";
import { PLACES_ACTIVITY_SNAPSHOT_FIELD_MASK, PLACES_DETAILS_FIELD_MASK } from "@/features/places/constants";

const {
  requireTripMemberMock,
  requireUserMock,
  resolveActivityGooglePlaceIdForPhotoMock,
  resolveAccommodationGooglePlaceIdForPhotoMock,
  servePlacePhotoResponseMock,
} = vi.hoisted(() => ({
  requireTripMemberMock: vi.fn(),
  requireUserMock: vi.fn(),
  resolveActivityGooglePlaceIdForPhotoMock: vi.fn(),
  resolveAccommodationGooglePlaceIdForPhotoMock: vi.fn(),
  servePlacePhotoResponseMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/place-images/resolve-photo-entity", () => ({
  resolveActivityGooglePlaceIdForPhoto: resolveActivityGooglePlaceIdForPhotoMock,
  resolveAccommodationGooglePlaceIdForPhoto: resolveAccommodationGooglePlaceIdForPhotoMock,
}));

vi.mock("@/features/place-images/serve-place-photo", () => ({
  servePlacePhotoResponse: servePlacePhotoResponseMock,
}));

const tripId = "507f1f77bcf86cd799439011";
const entityId = "507f1f77bcf86cd799439012";

describe("entity-scoped place photo routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripMemberMock.mockResolvedValue({ id: tripId });
    requireUserMock.mockResolvedValue({ id: "user-1" });
    servePlacePhotoResponseMock.mockResolvedValue(
      new Response(new Uint8Array([1]), {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      }),
    );
  });

  it("activity route rejects manual activities without calling Google", async () => {
    resolveActivityGooglePlaceIdForPhotoMock.mockResolvedValue(null);

    const response = await getActivityPhoto(new Request("http://localhost/photo"), {
      params: Promise.resolve({ tripId, activityId: entityId }),
    });

    expect(response.status).toBe(404);
    expect(servePlacePhotoResponseMock).not.toHaveBeenCalled();
  });

  it("activity route uses stored googlePlaceId only", async () => {
    resolveActivityGooglePlaceIdForPhotoMock.mockResolvedValue("ChIJActivity");

    await getActivityPhoto(new Request("http://localhost/photo"), {
      params: Promise.resolve({ tripId, activityId: entityId }),
    });

    expect(servePlacePhotoResponseMock).toHaveBeenCalledWith({
      googlePlaceId: "ChIJActivity",
      userId: "user-1",
    });
  });

  it("accommodation route rejects manual accommodations without calling Google", async () => {
    resolveAccommodationGooglePlaceIdForPhotoMock.mockResolvedValue(null);

    const response = await getAccommodationPhoto(new Request("http://localhost/photo"), {
      params: Promise.resolve({ tripId, accommodationId: entityId }),
    });

    expect(response.status).toBe(404);
    expect(servePlacePhotoResponseMock).not.toHaveBeenCalled();
  });

  it("accommodation route uses stored googlePlaceId only", async () => {
    resolveAccommodationGooglePlaceIdForPhotoMock.mockResolvedValue("ChIJHotel");

    await getAccommodationPhoto(new Request("http://localhost/photo"), {
      params: Promise.resolve({ tripId, accommodationId: entityId }),
    });

    expect(servePlacePhotoResponseMock).toHaveBeenCalledWith({
      googlePlaceId: "ChIJHotel",
      userId: "user-1",
    });
  });

  it("requires trip membership before serving photos", async () => {
    requireTripMemberMock.mockRejectedValue(new Error("not found"));

    await expect(
      getActivityPhoto(new Request("http://localhost/photo"), {
        params: Promise.resolve({ tripId, activityId: entityId }),
      }),
    ).rejects.toThrow("not found");
  });

  it("preserves unchanged Activity and Accommodation create field masks", () => {
    expect(PLACES_ACTIVITY_SNAPSHOT_FIELD_MASK).toBe(
      "id,displayName,formattedAddress,googleMapsUri,addressComponents,location",
    );
    expect(PLACES_DETAILS_FIELD_MASK).toBe(
      "id,displayName,formattedAddress,googleMapsUri,addressComponents",
    );
    expect(PLACES_ACTIVITY_SNAPSHOT_FIELD_MASK).not.toContain("photos");
    expect(PLACES_DETAILS_FIELD_MASK).not.toContain("photos");
  });
});
