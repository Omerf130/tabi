import { describe, expect, it } from "vitest";
import { isAccommodationOccupiedOnDate } from "@/features/accommodations/accommodation-domain";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import {
  buildActiveHomeItineraryPreview,
  HOME_ITINERARY_PREVIEW_MAX,
} from "./build-home-itinerary-preview";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";
import { DURING_SURFACE_SECTION_ORDER } from "./DuringTripJourney";
import { resolveNowAndNextUp } from "./resolve-now-and-next-up";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "יפן 2026",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id">,
): ActivityViewModel {
  return {
    date: "2026-11-01",
    title: "פעילות",
    type: "other",
    typeLabel: "אחר",
    order: 0,
    placeSource: "manual",
    ...overrides,
  };
}

function accommodation(
  overrides: Partial<AccommodationViewModel> & Pick<AccommodationViewModel, "id">,
): AccommodationViewModel {
  return {
    tripId: trip.id,
    placeSource: "google",
    googlePlaceId: "acc-place",
    name: "Hotel Gracery Shinjuku",
    city: "Shinjuku City",
    checkInDate: "2026-10-30",
    checkOutDate: "2026-11-05",
    checkInLabel: "30 Oct",
    checkOutLabel: "5 Nov",
    dateRangeLabel: "30 Oct – 5 Nov",
    nightCount: 6,
    usesGoogleAttribution: true,
    googleMapsUrl: "https://maps.example/hotel",
    ...overrides,
  };
}

describe("during trip home", () => {
  it("defines the main surface section order", () => {
    expect(DURING_SURFACE_SECTION_ORDER).toEqual([
      "importantToday",
      "todaysPlan",
      "now",
      "upNext",
      "tonight",
    ]);
  });

  it("preserves today's plan full-day route in the view model", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "13:00",
      dayActivities: [
        activity({ id: "a1", title: "Morning", startTime: "09:00" }),
      ],
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.todaysPlan.ctaHref).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary/2026-11-01",
    );
  });

  it("preserves today's plan max preview behavior", () => {
    const dayActivities = Array.from({ length: HOME_ITINERARY_PREVIEW_MAX + 2 }, (_, index) =>
      activity({
        id: `a${index}`,
        title: `Activity ${index}`,
        order: index,
        startTime: `${String(9 + index).padStart(2, "0")}:00`,
      }),
    );

    const preview = buildActiveHomeItineraryPreview(
      dayActivities,
      [],
      "08:00",
      new Set(),
    );

    expect(preview.items).toHaveLength(HOME_ITINERARY_PREVIEW_MAX);
    expect(preview.overflowCount).toBe(2);
  });

  it("selects NOW and UP NEXT activities for compact cards", () => {
    const dayActivities = [
      activity({
        id: "now",
        title: "TeamLab Planets",
        order: 0,
        startTime: "12:30",
        endTime: "14:00",
      }),
      activity({
        id: "next",
        title: "Fushimi Inari",
        order: 1,
        startTime: "16:00",
        endTime: "18:00",
      }),
    ];

    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "13:00",
      dayActivities,
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.now?.id).toBe("now");
    expect(model.upNext?.id).toBe("next");
  });

  it("keeps NOW semantics requiring start and end times", () => {
    const { nowActivity } = resolveNowAndNextUp(
      [
        activity({
          id: "start-only",
          title: "Start only",
          startTime: "22:00",
        }),
        activity({
          id: "window",
          title: "Night show",
          startTime: "22:00",
          endTime: "23:00",
        }),
      ],
      "22:30",
    );

    expect(nowActivity?.id).toBe("window");
  });

  it("omits important today when there are no reminders", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "10:00",
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.importantToday).toBeNull();
  });

  it("includes tonight accommodation occupancy on the active day", () => {
    const tonightAccommodation = accommodation({ id: "acc1" });

    expect(
      isAccommodationOccupiedOnDate(
        tonightAccommodation.checkInDate,
        tonightAccommodation.checkOutDate,
        "2026-11-01",
      ),
    ).toBe(true);

    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "20:00",
      tonightAccommodation,
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.tonight?.name).toBe("Hotel Gracery Shinjuku");
    expect(model.tonight?.city).toBe("Shinjuku City");
  });

  it("limits during Google image slots to now, up next, and tonight", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "13:00",
      dayActivities: [
        activity({
          id: "now",
          title: "Now",
          startTime: "12:00",
          endTime: "14:00",
        }),
        activity({
          id: "next",
          title: "Next",
          startTime: "16:00",
          endTime: "18:00",
        }),
      ],
      tonightAccommodation: accommodation({ id: "acc1" }),
      nowPhotoPresentation: { hasPhoto: true, photoHref: "/now", authorAttributions: [] },
      upNextPhotoPresentation: { hasPhoto: true, photoHref: "/next", authorAttributions: [] },
      tonightPhotoPresentation: { hasPhoto: true, photoHref: "/tonight", authorAttributions: [] },
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    const photoSlots = [
      model.now?.photoPresentation,
      model.upNext?.photoPresentation,
      model.tonight?.photoPresentation,
    ].filter(Boolean);

    expect(photoSlots).toHaveLength(3);
    expect(model.todaysPlan.items.every((item) => !("photoPresentation" in item))).toBe(true);
  });
});
