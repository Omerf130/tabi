import {
  mergeItineraryDayItems,
  type ItineraryDayItem,
} from "@/features/transport/merge-itinerary-day-items";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import { isItineraryItemPassed } from "./is-itinerary-item-passed";
import type { ActivityViewModel } from "./types";

export type ResolveNextTwoDayItemsInput = {
  activities: readonly ActivityViewModel[];
  transports: readonly TransportItineraryItemViewModel[];
  filterPassed: boolean;
  nowJapanTime?: string;
};

export function resolveNextTwoDayItems({
  activities,
  transports,
  filterPassed,
  nowJapanTime,
}: ResolveNextTwoDayItemsInput): ItineraryDayItem[] {
  const merged = mergeItineraryDayItems(activities, transports);

  const eligible =
    filterPassed && nowJapanTime
      ? merged.filter((item) => !isItineraryItemPassed(item, nowJapanTime))
      : merged;

  return eligible.slice(0, 2);
}
