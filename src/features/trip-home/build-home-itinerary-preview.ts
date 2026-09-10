import { isItineraryItemPassed } from "@/features/itinerary/is-itinerary-item-passed";
import type { ActivityViewModel } from "@/features/itinerary/types";
import {
  mergeItineraryDayItems,
  type ItineraryDayItem,
} from "@/features/transport/merge-itinerary-day-items";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";

export const HOME_ITINERARY_PREVIEW_MAX = 4;

export type HomeItineraryPreviewItem = {
  id: string;
  kind: "activity" | "transport";
  title: string;
  displayTime?: string;
  isUntimed: boolean;
  locationName?: string;
  detailHref?: string;
};

export type HomeItineraryPreview = {
  items: HomeItineraryPreviewItem[];
  overflowCount: number;
  isEmpty: boolean;
};

function toPreviewItem(item: ItineraryDayItem): HomeItineraryPreviewItem {
  if (item.kind === "activity") {
    return {
      id: item.activity.id,
      kind: "activity",
      title: item.activity.title,
      displayTime: item.activity.startTime,
      isUntimed: !item.activity.startTime,
      locationName: item.activity.locationName,
    };
  }

  return {
    id: item.transport.id,
    kind: "transport",
    title: `${item.transport.typeLabel} · ${item.transport.routeLabel}`,
    displayTime: item.transport.departureTime,
    isUntimed: false,
    detailHref: item.transport.detailHref,
  };
}

function filterMergedItems(
  merged: readonly ItineraryDayItem[],
  options: {
    excludeActivityIds?: ReadonlySet<string>;
    filterPassed?: boolean;
    nowJapanTime?: string;
  },
): ItineraryDayItem[] {
  return merged.filter((item) => {
    if (item.kind === "activity" && options.excludeActivityIds?.has(item.activity.id)) {
      return false;
    }

    if (
      options.filterPassed &&
      options.nowJapanTime &&
      isItineraryItemPassed(item, options.nowJapanTime)
    ) {
      return false;
    }

    return true;
  });
}

export function buildUpcomingHomeItineraryPreview(
  activities: readonly ActivityViewModel[],
  transports: readonly TransportItineraryItemViewModel[],
): HomeItineraryPreview {
  const merged = mergeItineraryDayItems(activities, transports);
  const preview = merged.slice(0, HOME_ITINERARY_PREVIEW_MAX);

  return {
    items: preview.map(toPreviewItem),
    overflowCount: Math.max(0, merged.length - preview.length),
    isEmpty: merged.length === 0,
  };
}

export function buildActiveHomeItineraryPreview(
  activities: readonly ActivityViewModel[],
  transports: readonly TransportItineraryItemViewModel[],
  nowJapanTime: string,
  excludeActivityIds: ReadonlySet<string>,
): HomeItineraryPreview {
  const merged = mergeItineraryDayItems(activities, transports);
  const eligible = filterMergedItems(merged, {
    excludeActivityIds,
    filterPassed: true,
    nowJapanTime,
  });
  const preview = eligible.slice(0, HOME_ITINERARY_PREVIEW_MAX);

  return {
    items: preview.map(toPreviewItem),
    overflowCount: Math.max(0, eligible.length - preview.length),
    isEmpty: merged.length === 0,
  };
}
