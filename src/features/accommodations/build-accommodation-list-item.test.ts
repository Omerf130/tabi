import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { buildAccommodationListItem } from "./build-accommodation-list-item";
import type { AccommodationViewModel } from "./types";

const tripId = "507f1f77bcf86cd799439011";
const t = createAppTranslator("Accommodation", "he");

const baseAccommodation: AccommodationViewModel = {
  id: "acc-1",
  tripId,
  placeSource: "google",
  googlePlaceId: "place-1",
  name: "Hotel Granvia Kyoto",
  city: "Kyoto",
  checkInDate: "2026-10-24",
  checkOutDate: "2026-10-27",
  checkInLabel: "24 Oct 2026",
  checkOutLabel: "27 Oct 2026",
  dateRangeLabel: "24 Oct 2026 – 27 Oct 2026",
  nightCount: 3,
  usesGoogleAttribution: true,
};

describe("buildAccommodationListItem", () => {
  it("derives list labels and canonical detail href", () => {
    const item = buildAccommodationListItem(
      tripId,
      baseAccommodation,
      "2026-10-25",
      t,
    );

    expect(item.locationLabel).toBe("Kyoto");
    expect(item.dateRangeCompactLabel).toBe("24.10 – 27.10");
    expect(item.nightCountLabel).toBe("3 לילות");
    expect(item.detailHref).toBe(`/app/trips/${tripId}/accommodations/acc-1`);
  });

  it("marks current stays using occupancy semantics", () => {
    const current = buildAccommodationListItem(
      tripId,
      baseAccommodation,
      "2026-10-25",
      t,
    );
    const future = buildAccommodationListItem(
      tripId,
      baseAccommodation,
      "2026-10-20",
      t,
    );

    expect(current.isCurrentStay).toBe(true);
    expect(future.isCurrentStay).toBe(false);
  });

  it("keeps place photo only when presentation has a real href", () => {
    const withPhoto = buildAccommodationListItem(
      tripId,
      baseAccommodation,
      "2026-10-25",
      t,
      {
        hasPhoto: true,
        photoHref: `/app/trips/${tripId}/accommodations/acc-1/photo`,
        authorAttributions: [],
      },
    );
    const withoutPhoto = buildAccommodationListItem(
      tripId,
      baseAccommodation,
      "2026-10-25",
      t,
      { hasPhoto: false, authorAttributions: [] },
    );

    expect(withPhoto.placePhoto?.photoHref).toContain("/photo");
    expect(withoutPhoto.placePhoto).toBeUndefined();
  });
});
