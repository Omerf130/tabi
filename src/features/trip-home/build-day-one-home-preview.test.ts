import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import {
  buildDayOneHomePreview,
  getDayOneAccommodation,
} from "./build-day-one-home-preview";

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
    placeSource: "manual",
    ...overrides,
  };
}

function transport(
  overrides: Partial<TransportItineraryItemViewModel> &
    Pick<TransportItineraryItemViewModel, "id">,
): TransportItineraryItemViewModel {
  return {
    type: "train",
    typeLabel: "רכבת",
    routeLabel: "נarita → tokyo",
    timeLabel: "10:00",
    departureTime: "10:00",
    detailHref: "/transport/1",
    ...overrides,
  };
}

function accommodation(
  overrides: Partial<AccommodationViewModel> & Pick<AccommodationViewModel, "id">,
): AccommodationViewModel {
  return {
    tripId: "trip",
    placeSource: "manual",
    name: "Hotel",
    city: "Tokyo",
    checkInDate: startDate,
    checkOutDate: "2026-10-28",
    checkInLabel: "25 Oct",
    checkOutLabel: "28 Oct",
    dateRangeLabel: "25–28 Oct",
    nightCount: 3,
    usesGoogleAttribution: false,
    ...overrides,
  };
}

describe("getDayOneAccommodation", () => {
  it("includes accommodation when checkIn <= startDate < checkOut", () => {
    const selected = getDayOneAccommodation(
      [accommodation({ id: "a1", name: "Shinjuku Hotel" })],
      startDate,
    );

    expect(selected?.id).toBe("a1");
  });

  it("excludes accommodation outside occupancy range", () => {
    const selected = getDayOneAccommodation(
      [
        accommodation({
          id: "a1",
          checkInDate: "2026-10-26",
          checkOutDate: "2026-10-28",
        }),
      ],
      startDate,
    );

    expect(selected).toBeNull();
  });
});

describe("buildDayOneHomePreview", () => {
  it("presents transport, accommodation, and activity in order", () => {
    const preview = buildDayOneHomePreview(
      startDate,
      [
        activity({ id: "act1", title: "Shibuya", order: 1, startTime: "15:00" }),
      ],
      [transport({ id: "t1", departureTime: "09:00" })],
      [accommodation({ id: "a1", name: "Shinjuku Hotel" })],
    );

    expect(preview.items.map((item) => item.kind)).toEqual([
      "transport",
      "accommodation",
      "activity",
    ]);
    expect(preview.accommodation?.name).toBe("Shinjuku Hotel");
  });

  it("marks preview empty when there is no day content", () => {
    const preview = buildDayOneHomePreview(startDate, [], [], []);

    expect(preview.isEmpty).toBe(true);
    expect(preview.items).toEqual([]);
  });
});
