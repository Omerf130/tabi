import { compareWallClockTimes } from "@/features/itinerary/time";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { compareTransportDepartureTimesForSameDay } from "./transport-datetime";
import type { TransportItineraryItemViewModel } from "./types";

export type ItineraryDayItem =
  | { kind: "activity"; activity: ActivityViewModel }
  | { kind: "transport"; transport: TransportItineraryItemViewModel };

function findTransportInsertIndex(
  items: ItineraryDayItem[],
  transportTime: string,
): number {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]!;
    if (item.kind === "activity" && item.activity.startTime) {
      if (compareWallClockTimes(item.activity.startTime, transportTime) > 0) {
        return index;
      }
    }
  }

  return items.length;
}

export function mergeItineraryDayItems(
  activities: readonly ActivityViewModel[],
  transports: readonly TransportItineraryItemViewModel[],
): ItineraryDayItem[] {
  const items: ItineraryDayItem[] = activities.map((activity) => ({
    kind: "activity",
    activity,
  }));

  const sortedTransports = [...transports].sort((left, right) => {
    const byTime = compareTransportDepartureTimesForSameDay(
      left.departureTime,
      right.departureTime,
    );
    if (byTime !== 0) {
      return byTime;
    }
    return left.id.localeCompare(right.id);
  });

  for (const transport of sortedTransports) {
    const insertIndex = findTransportInsertIndex(items, transport.departureTime);
    items.splice(insertIndex, 0, { kind: "transport", transport });
  }

  return items;
}

export function countItineraryDayItems(items: readonly ItineraryDayItem[]): {
  activityCount: number;
  transportCount: number;
  totalCount: number;
} {
  let activityCount = 0;
  let transportCount = 0;

  for (const item of items) {
    if (item.kind === "activity") {
      activityCount += 1;
    } else {
      transportCount += 1;
    }
  }

  return {
    activityCount,
    transportCount,
    totalCount: activityCount + transportCount,
  };
}
