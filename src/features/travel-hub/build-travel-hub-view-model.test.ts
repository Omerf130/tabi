import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { buildTravelHubViewModel } from "./build-travel-hub-view-model";

const tripId = "507f1f77bcf86cd799439011";

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
    googleMapsUrl: "https://maps.google.com/example",
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
  it("builds working tool hrefs and disabled future tools", () => {
    const model = buildTravelHubViewModel({
      tripId,
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      accommodations: [],
      lists: [],
      todayJapan: "2026-10-01",
    });

    const accommodationsTool = model.tools.find((tool) => tool.id === "accommodations");
    const listsTool = model.tools.find((tool) => tool.id === "lists");
    const currencyTool = model.tools.find((tool) => tool.id === "currency");
    const weatherTool = model.tools.find((tool) => tool.id === "weather");
    const transportTool = model.tools.find((tool) => tool.id === "transport");
    const languageTool = model.tools.find((tool) => tool.id === "language");
    const emergencyTool = model.tools.find((tool) => tool.id === "emergency");

    expect(accommodationsTool?.href).toBe(`/app/trips/${tripId}/accommodations`);
    expect(listsTool?.href).toBe(`/app/trips/${tripId}/lists`);
    expect(currencyTool?.href).toBe(`/app/trips/${tripId}/currency`);
    expect(currencyTool?.status).toBe("active");
    expect(weatherTool?.href).toBe(`/app/trips/${tripId}/weather`);
    expect(weatherTool?.status).toBe("active");
    expect(transportTool?.href).toBe(`/app/trips/${tripId}/transport`);
    expect(transportTool?.status).toBe("active");
    expect(languageTool?.href).toBe(`/app/trips/${tripId}/language`);
    expect(languageTool?.status).toBe("active");
    expect(languageTool?.label).toBe("שפה ותקשורת");
    expect(emergencyTool?.href).toBe(`/app/trips/${tripId}/emergency`);
    expect(emergencyTool?.status).toBe("active");
    expect(emergencyTool?.label).toBe("חירום ועזרה");

    const manageTool = model.tools.find((tool) => tool.id === "manage");

    expect(model.tools).toHaveLength(8);
    expect(manageTool?.href).toBe(`/app/trips/${tripId}/manage`);
    expect(manageTool?.status).toBe("active");
    expect(manageTool?.label).toBe("הגדרות וניהול");
  });

  it("includes contextual accommodation and photo href when available", () => {
    const model = buildTravelHubViewModel({
      tripId,
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      accommodations: [
        makeAccommodation({
          id: "acc-google",
          googlePlaceId: "places/test",
          usesGoogleAttribution: true,
        }),
      ],
      lists: [],
      todayJapan: "2026-10-01",
      accommodationPhotoPresentation: {
        hasPhoto: true,
        photoHref: `/app/trips/${tripId}/accommodations/acc-google/photo`,
        authorAttributions: [],
      },
    });

    expect(model.contextualAccommodation?.title).toBe("הלינה הבאה שלך");
    expect(model.contextualAccommodation?.placePhoto?.photoHref).toBe(
      `/app/trips/${tripId}/accommodations/acc-google/photo`,
    );
    expect(model.contextualAccommodation?.showGoogleAttribution).toBe(true);
  });

  it("omits attention list when all relevant lists are complete", () => {
    const model = buildTravelHubViewModel({
      tripId,
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      accommodations: [],
      lists: [
        makeList("before_trip", 6, 6),
        makeList("pre_trip_shopping", 6, 6),
        makeList("packing", 8, 8),
      ],
      todayJapan: "2026-10-01",
    });

    expect(model.attentionList).toBeNull();
  });

  it("links attention list to list detail route", () => {
    const model = buildTravelHubViewModel({
      tripId,
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      accommodations: [],
      lists: [makeList("packing", 8, 3)],
      todayJapan: "2026-10-01",
    });

    expect(model.attentionList?.href).toBe(`/app/trips/${tripId}/lists/packing`);
  });

});
