import {
  compareAccommodations,
  isAccommodationOccupiedOnDate,
} from "@/features/accommodations/accommodation-domain";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { mergeItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";

export const DAY_ONE_PREVIEW_ITEM_LIMIT = 4;

export type DayOnePreviewItem = {
  id: string;
  kind: "activity" | "transport" | "accommodation";
  title: string;
  displayTime?: string;
  subtitle?: string;
};

export type DayOneHomePreview = {
  items: DayOnePreviewItem[];
  overflowCount: number;
  isEmpty: boolean;
  accommodation: AccommodationViewModel | null;
};

export function getDayOneAccommodation(
  accommodations: readonly AccommodationViewModel[],
  startDate: string,
): AccommodationViewModel | null {
  const occupied = accommodations
    .filter((accommodation) =>
      isAccommodationOccupiedOnDate(
        accommodation.checkInDate,
        accommodation.checkOutDate,
        startDate,
      ),
    )
    .sort(compareAccommodations);

  return occupied[0] ?? null;
}

function toAccommodationPreviewItem(
  accommodation: AccommodationViewModel,
): DayOnePreviewItem {
  return {
    id: accommodation.id,
    kind: "accommodation",
    title: accommodation.name,
    subtitle: accommodation.city,
  };
}

function toMergedPreviewItem(
  item: ReturnType<typeof mergeItineraryDayItems>[number],
): DayOnePreviewItem {
  if (item.kind === "activity") {
    return {
      id: item.activity.id,
      kind: "activity",
      title: item.activity.title,
      displayTime: item.activity.startTime,
      subtitle: item.activity.locationName,
    };
  }

  return {
    id: item.transport.id,
    kind: "transport",
    title: `${item.transport.typeLabel} · ${item.transport.routeLabel}`,
    displayTime: item.transport.departureTime,
  };
}

export function buildDayOneHomePreview(
  startDate: string,
  activities: readonly ActivityViewModel[],
  transports: readonly TransportItineraryItemViewModel[],
  accommodations: readonly AccommodationViewModel[],
): DayOneHomePreview {
  const merged = mergeItineraryDayItems(activities, transports);
  const accommodation = getDayOneAccommodation(accommodations, startDate);
  const items: DayOnePreviewItem[] = [];
  let accommodationAdded = false;
  let mergedIndex = 0;

  while (mergedIndex < merged.length && merged[mergedIndex]?.kind === "transport") {
    items.push(toMergedPreviewItem(merged[mergedIndex]!));
    mergedIndex += 1;
  }

  if (accommodation && items.length < DAY_ONE_PREVIEW_ITEM_LIMIT) {
    items.push(toAccommodationPreviewItem(accommodation));
    accommodationAdded = true;
  }

  while (mergedIndex < merged.length && items.length < DAY_ONE_PREVIEW_ITEM_LIMIT) {
    items.push(toMergedPreviewItem(merged[mergedIndex]!));
    mergedIndex += 1;
  }

  if (
    accommodation &&
    !accommodationAdded &&
    items.length < DAY_ONE_PREVIEW_ITEM_LIMIT
  ) {
    items.push(toAccommodationPreviewItem(accommodation));
    accommodationAdded = true;
  }

  const totalRepresented = merged.length + (accommodation ? 1 : 0);

  return {
    items,
    overflowCount: Math.max(0, totalRepresented - items.length),
    isEmpty: items.length === 0,
    accommodation,
  };
}
