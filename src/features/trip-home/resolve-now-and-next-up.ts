import { compareWallClockTimes } from "@/features/itinerary/time";
import type { ActivityViewModel } from "@/features/itinerary/types";

export type NowAndNextUpResult = {
  nowActivity?: ActivityViewModel;
  nextActivity?: ActivityViewModel;
  untimedActivities: ActivityViewModel[];
};

function hasStartTime(
  activity: ActivityViewModel,
): activity is ActivityViewModel & { startTime: string } {
  return Boolean(activity.startTime);
}

function compareTimedActivitiesForNextUp(
  a: ActivityViewModel & { startTime: string },
  b: ActivityViewModel & { startTime: string },
): number {
  const byStart = compareWallClockTimes(a.startTime, b.startTime);
  if (byStart !== 0) {
    return byStart;
  }
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  return a.id.localeCompare(b.id);
}

function isTimedActivityFinished(
  activity: ActivityViewModel & { startTime: string },
  nowJapanTime: string,
): boolean {
  if (activity.endTime) {
    return compareWallClockTimes(nowJapanTime, activity.endTime) >= 0;
  }

  return compareWallClockTimes(nowJapanTime, activity.startTime) > 0;
}

function isTimedActivityNow(
  activity: ActivityViewModel & { startTime: string },
  nowJapanTime: string,
): boolean {
  if (!activity.endTime) {
    return false;
  }

  return (
    compareWallClockTimes(nowJapanTime, activity.startTime) >= 0 &&
    compareWallClockTimes(nowJapanTime, activity.endTime) < 0
  );
}

export function resolveNowAndNextUp(
  activities: readonly ActivityViewModel[],
  nowJapanTime: string,
): NowAndNextUpResult {
  const timedActivities = activities.filter(hasStartTime);
  const untimedActivities = activities.filter((activity) => !activity.startTime);

  const nowCandidates = timedActivities
    .filter((activity) => isTimedActivityNow(activity, nowJapanTime))
    .sort(compareTimedActivitiesForNextUp);

  const nowActivity = nowCandidates[0];

  const nextCandidates = timedActivities
    .filter((activity) => !isTimedActivityFinished(activity, nowJapanTime))
    .filter((activity) => activity.id !== nowActivity?.id)
    .sort(compareTimedActivitiesForNextUp);

  return {
    nowActivity,
    nextActivity: nextCandidates[0],
    untimedActivities,
  };
}
