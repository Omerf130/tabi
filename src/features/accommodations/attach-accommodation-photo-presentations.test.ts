import { beforeEach, describe, expect, it, vi } from "vitest";
import { attachAccommodationPhotoPresentations } from "./attach-accommodation-photo-presentations";
import type { AccommodationViewModel } from "./types";

const getPlacePhotoPresentation = vi.fn();
const createPlacePhotoRequestContext = vi.fn(() => ({ id: "ctx" }));

vi.mock("@/features/place-images/get-place-photo-presentation", () => ({
  getPlacePhotoPresentation: (...args: unknown[]) => getPlacePhotoPresentation(...args),
}));

vi.mock("@/features/place-images/request-dedupe", () => ({
  createPlacePhotoRequestContext: () => createPlacePhotoRequestContext(),
}));

const tripId = "507f1f77bcf86cd799439011";

function accommodation(
  overrides: Partial<AccommodationViewModel> & Pick<AccommodationViewModel, "id">,
): AccommodationViewModel {
  return {
    tripId,
    placeSource: "google",
    googlePlaceId: "place-1",
    name: "Hotel Granvia Kyoto",
    checkInDate: "2026-10-24",
    checkOutDate: "2026-10-27",
    checkInLabel: "24 Oct 2026",
    checkOutLabel: "27 Oct 2026",
    dateRangeLabel: "24 Oct 2026 – 27 Oct 2026",
    nightCount: 3,
    usesGoogleAttribution: true,
    ...overrides,
  };
}

describe("attachAccommodationPhotoPresentations", () => {
  beforeEach(() => {
    getPlacePhotoPresentation.mockReset();
    createPlacePhotoRequestContext.mockClear();
    getPlacePhotoPresentation.mockResolvedValue({
      hasPhoto: true,
      photoHref: `/app/trips/${tripId}/accommodations/acc-1/photo`,
      authorAttributions: [],
    });
  });

  it("fetches photos only for google-backed accommodations", async () => {
    const result = await attachAccommodationPhotoPresentations(tripId, [
      accommodation({ id: "acc-1" }),
      accommodation({
        id: "acc-2",
        placeSource: "manual",
        googlePlaceId: undefined,
      }),
    ]);

    expect(getPlacePhotoPresentation).toHaveBeenCalledTimes(1);
    expect(createPlacePhotoRequestContext).toHaveBeenCalledTimes(1);
    expect(result.get("acc-1")?.hasPhoto).toBe(true);
    expect(result.has("acc-2")).toBe(false);
  });
});
