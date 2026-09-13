import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { createHebrewTravelHubTranslators } from "@/features/i18n/test-translators";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { buildTravelHubViewModel } from "./build-travel-hub-view-model";

const travelHubTranslators = createHebrewTravelHubTranslators();

const tripId = "507f1f77bcf86cd799439011";

const emptyFinance = {
  href: `/app/trips/${tripId}/finance`,
  hasBudget: false,
  hasExpenses: false,
  baseCurrency: "ILS",
  totalExpenses: 0,
  budgetAmount: null,
  remainingBudget: null,
  percentConsumed: null,
};

const trip = {
  id: tripId,
  name: "Japan 2026",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

function makeAccommodation(
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
    checkInLabel: "25 Oct 2026",
    checkOutLabel: "28 Oct 2026",
    dateRangeLabel: "25 Oct – 28 Oct 2026",
    nightCount: 3,
    usesGoogleAttribution: false,
    ...overrides,
  };
}

function makeList(
  type: TripListSummaryViewModel["type"],
  totalCount: number,
  completedCount: number,
): TripListSummaryViewModel {
  return {
    type,
    slug:
      type === "before_trip"
        ? "before-trip"
        : type === "during_trip"
          ? "during-trip"
          : type === "pre_trip_shopping"
            ? "pre-trip-shopping"
            : "packing",
    title: "רשימה",
    icon: "grid",
    progress: { totalCount, completedCount },
    progressLabel: `${completedCount} מתוך ${totalCount} הושלמו`,
  };
}

describe("buildTravelHubViewModel", () => {
  it("builds essentials hierarchy with canonical hrefs", () => {
    const model = buildTravelHubViewModel({
      trip,
      accommodations: [],
      transports: [],
      lists: [],
      documentCount: 0,
      currentTripDate: "2026-10-01",
      finance: emptyFinance,
      ...travelHubTranslators,
    });

    expect(model.hero.title).toBe("כלי הטיול");
    expect(model.accommodation.href).toBe(`/app/trips/${tripId}/accommodations`);
    expect(model.transport.href).toBe(`/app/trips/${tripId}/transport`);
    expect(model.finance.href).toBe(`/app/trips/${tripId}/finance`);
    expect(model.materials.lists.href).toBe(`/app/trips/${tripId}/lists`);
    expect(model.materials.documents.href).toBe(`/app/trips/${tripId}/documents`);
    expect(model.management.href).toBe(`/app/trips/${tripId}/manage`);
    expect(model.quickTools.map((tool) => tool.id)).toEqual([
      "currency",
      "weather",
      "language",
      "emergency",
    ]);
    expect(model.quickTools.find((tool) => tool.id === "currency")?.href).toBe(
      `/app/trips/${tripId}/currency`,
    );
  });

  it("includes accommodation detail and optional photo", () => {
    const model = buildTravelHubViewModel({
      trip,
      accommodations: [
        makeAccommodation({
          id: "acc-google",
          googlePlaceId: "places/test",
          usesGoogleAttribution: true,
        }),
      ],
      transports: [],
      lists: [],
      documentCount: 0,
      currentTripDate: "2026-10-01",
      accommodationPhotoPresentation: {
        hasPhoto: true,
        photoHref: `/app/trips/${tripId}/accommodations/acc-google/photo`,
        authorAttributions: [],
      },
      finance: emptyFinance,
      ...travelHubTranslators,
    });

    expect(model.accommodation.detailLine).toBe("הבא: Hotel Gracery Shinjuku");
    expect(model.accommodation.thumbnail?.photoHref).toBe(
      `/app/trips/${tripId}/accommodations/acc-google/photo`,
    );
  });

  it("uses real lists and documents metrics", () => {
    const model = buildTravelHubViewModel({
      trip,
      accommodations: [],
      transports: [{ id: "t1" } as never, { id: "t2" } as never],
      lists: [makeList("packing", 8, 3)],
      documentCount: 5,
      currentTripDate: "2026-10-01",
      finance: emptyFinance,
      ...travelHubTranslators,
    });

    expect(model.transport.countLabel).toBe("2 קטעי תחבורה");
    expect(model.transport.detailLine).toBeNull();
    expect(model.materials.lists.secondaryLine).toBe("3 מתוך 8 הושלמו");
    expect(model.materials.documents.secondaryLine).toBe("5 מסמכים");
  });
});
