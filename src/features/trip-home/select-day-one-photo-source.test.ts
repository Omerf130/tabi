import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { selectDayOnePhotoSource } from "./select-day-one-photo-source";

const startDate = "2026-10-25";

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id">,
): ActivityViewModel {
  return {
    date: startDate,
    title: "פעילות",
    type: "other",
    typeLabel: "אחר",
    order: 0,
    placeSource: "google",
    ...overrides,
  };
}

function accommodation(
  overrides: Partial<AccommodationViewModel> & Pick<AccommodationViewModel, "id">,
): AccommodationViewModel {
  return {
    tripId: "trip",
    placeSource: "google",
    googlePlaceId: "acc-place",
    name: "Hotel",
    city: "Tokyo",
    checkInDate: startDate,
    checkOutDate: "2026-10-28",
    checkInLabel: "25 Oct",
    checkOutLabel: "28 Oct",
    dateRangeLabel: "25–28 Oct",
    nightCount: 3,
    usesGoogleAttribution: true,
    ...overrides,
  };
}

describe("selectDayOnePhotoSource", () => {
  it("prefers the first Google-backed activity", () => {
    const source = selectDayOnePhotoSource(
      [
        activity({ id: "a1", googlePlaceId: "act-place", order: 0, startTime: "12:00" }),
      ],
      [],
      accommodation({ id: "h1" }),
    );

    expect(source).toEqual({
      kind: "activity",
      activityId: "a1",
      googlePlaceId: "act-place",
    });
  });

  it("falls back to accommodation when no Google-backed activity exists", () => {
    const source = selectDayOnePhotoSource(
      [activity({ id: "a1", placeSource: "manual", order: 0 })],
      [],
      accommodation({ id: "h1", googlePlaceId: "acc-place" }),
    );

    expect(source).toEqual({
      kind: "accommodation",
      accommodationId: "h1",
      googlePlaceId: "acc-place",
    });
  });

  it("returns null when no Google-backed source exists", () => {
    expect(
      selectDayOnePhotoSource(
        [activity({ id: "a1", placeSource: "manual" })],
        [],
        accommodation({ id: "h1", placeSource: "manual", googlePlaceId: undefined }),
      ),
    ).toBeNull();
  });
});
