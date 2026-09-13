import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { createHebrewTravelHubTranslators } from "@/features/i18n/test-translators";
import { buildTravelHubAccommodationRow } from "./build-travel-hub-accommodation-row";

const { t } = createHebrewTravelHubTranslators();
const tripId = "507f1f77bcf86cd799439011";

function accommodation(
  overrides: Partial<AccommodationViewModel> = {},
): AccommodationViewModel {
  return {
    id: "acc-1",
    tripId,
    placeSource: "manual",
    name: "Hotel Gracery Shinjuku",
    city: "Tokyo",
    checkInDate: "2026-10-25",
    checkOutDate: "2026-10-28",
    checkInLabel: "25 Oct",
    checkOutLabel: "28 Oct",
    dateRangeLabel: "25 Oct – 28 Oct",
    nightCount: 3,
    usesGoogleAttribution: false,
    ...overrides,
  };
}

describe("buildTravelHubAccommodationRow", () => {
  it("shows empty copy when there are no accommodations", () => {
    const row = buildTravelHubAccommodationRow({
      tripId,
      accommodations: [],
      tripPhase: "upcoming",
      currentTripDate: "2026-10-01",
      t,
    });

    expect(row.emptyLine).toBe("עדיין לא נוספו מקומות לינה");
    expect(row.countLabel).toBeNull();
  });

  it("shows count and upcoming detail for populated trips", () => {
    const row = buildTravelHubAccommodationRow({
      tripId,
      accommodations: [accommodation()],
      tripPhase: "upcoming",
      currentTripDate: "2026-10-01",
      t,
    });

    expect(row.countLabel).toBe("מקום לינה אחד");
    expect(row.detailLine).toBe("הבא: Hotel Gracery Shinjuku");
    expect(row.href).toBe(`/app/trips/${tripId}/accommodations`);
  });

  it("includes thumbnail only when photo presentation exists", () => {
    const row = buildTravelHubAccommodationRow({
      tripId,
      accommodations: [accommodation({ googlePlaceId: "places/test" })],
      tripPhase: "upcoming",
      currentTripDate: "2026-10-01",
      accommodationPhotoPresentation: {
        hasPhoto: true,
        photoHref: `/app/trips/${tripId}/accommodations/acc-1/photo`,
        authorAttributions: [],
      },
      t,
    });

    expect(row.thumbnail?.photoHref).toContain("/photo");
  });
});
