import { compareWallClockTimes } from "@/features/itinerary/time";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { ItineraryDayItem } from "@/features/transport/merge-itinerary-day-items";

function hasStartTime(
  activity: ActivityViewModel,
): activity is ActivityViewModel & { startTime: string } {
  return Boolean(activity.startTime);
}

export function isTimedActivityPassed(
  activity: ActivityViewModel,
  nowJapanTime: string,
): boolean {
  if (!hasStartTime(activity)) {
    return false;
  }

  if (activity.endTime) {
    return compareWallClockTimes(nowJapanTime, activity.endTime) >= 0;
  }

  return compareWallClockTimes(nowJapanTime, activity.startTime) > 0;
}

export function isItineraryItemPassed(
  item: ItineraryDayItem,
  nowJapanTime: string,
): boolean {
  if (item.kind === "activity") {
    return isTimedActivityPassed(item.activity, nowJapanTime);
  }

  return compareWallClockTimes(nowJapanTime, item.transport.departureTime) > 0;
}
