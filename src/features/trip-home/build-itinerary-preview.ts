import { compareWallClockTimes } from "@/features/itinerary/time";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { resolveNowAndNextUp } from "./resolve-now-and-next-up";
import type { DailyItineraryPreviewItem, ItineraryPreviewEmphasis } from "./types";

export const DAILY_ITINERARY_PREVIEW_MAX = 4;

function compareActivitiesForPreview(
  a: ActivityViewModel,
  b: ActivityViewModel,
): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.id.localeCompare(b.id);
}

function sortActivitiesForPreview(
  activities: readonly ActivityViewModel[],
): ActivityViewModel[] {
  return [...activities].sort(compareActivitiesForPreview);
}

function hasStartTime(
  activity: ActivityViewModel,
): activity is ActivityViewModel & { startTime: string } {
  return Boolean(activity.startTime);
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

export function selectItineraryPreviewIndices(
  sortedLength: number,
  anchorIndex: number,
  mustIncludeIndices: readonly number[],
  maxItems: number = DAILY_ITINERARY_PREVIEW_MAX,
): number[] {
  if (sortedLength === 0) {
    return [];
  }

  if (sortedLength <= maxItems) {
    return Array.from({ length: sortedLength }, (_, index) => index);
  }

  const selected = new Set<number>();
  for (const index of mustIncludeIndices) {
    if (index >= 0 && index < sortedLength) {
      selected.add(index);
    }
  }

  if (selected.size === 0 && anchorIndex >= 0 && anchorIndex < sortedLength) {
    selected.add(anchorIndex);
  }

  let before = anchorIndex - 1;
  let after = anchorIndex + 1;

  while (selected.size < maxItems) {
    let added = false;

    if (after < sortedLength && selected.size < maxItems) {
      selected.add(after);
      after += 1;
      added = true;
    }

    if (before >= 0 && selected.size < maxItems) {
      selected.add(before);
      before -= 1;
      added = true;
    }

    if (!added) {
      break;
    }
  }

  return [...selected].sort((a, b) => a - b);
}

function findPreviewAnchorIndex(
  sorted: readonly ActivityViewModel[],
  nowJapanTime: string,
  nowIndex: number,
  nextIndex: number,
): number {
  if (nowIndex >= 0) {
    return nowIndex;
  }

  if (nextIndex >= 0) {
    return nextIndex;
  }

  for (let index = 0; index < sorted.length; index += 1) {
    const activity = sorted[index]!;
    if (!hasStartTime(activity)) {
      return index;
    }

    if (!isTimedActivityFinished(activity, nowJapanTime)) {
      return index;
    }
  }

  return sorted.length - 1;
}

function toPreviewItem(
  activity: ActivityViewModel,
  emphasis?: ItineraryPreviewEmphasis,
): DailyItineraryPreviewItem {
  return {
    id: activity.id,
    title: activity.title,
    displayTime: activity.startTime,
    isUntimed: !activity.startTime,
    emphasis,
    locationName: activity.locationName,
  };
}

function resolveEmphasis(
  activity: ActivityViewModel,
  nowActivity?: ActivityViewModel,
  nextActivity?: ActivityViewModel,
): ItineraryPreviewEmphasis | undefined {
  if (nowActivity && activity.id === nowActivity.id) {
    return "now";
  }

  if (nextActivity && activity.id === nextActivity.id) {
    return "next";
  }

  return undefined;
}

export function buildUpcomingItineraryPreview(
  activities: readonly ActivityViewModel[],
): { items: DailyItineraryPreviewItem[]; overflowCount: number } {
  const sorted = sortActivitiesForPreview(activities);
  const preview = sorted.slice(0, DAILY_ITINERARY_PREVIEW_MAX);

  return {
    items: preview.map((activity) => toPreviewItem(activity)),
    overflowCount: Math.max(0, sorted.length - DAILY_ITINERARY_PREVIEW_MAX),
  };
}

export function buildActiveItineraryPreview(
  activities: readonly ActivityViewModel[],
  nowJapanTime: string,
): { items: DailyItineraryPreviewItem[]; overflowCount: number } {
  const sorted = sortActivitiesForPreview(activities);
  const { nowActivity, nextActivity } = resolveNowAndNextUp(sorted, nowJapanTime);

  const nowIndex = nowActivity
    ? sorted.findIndex((activity) => activity.id === nowActivity.id)
    : -1;
  const nextIndex = nextActivity
    ? sorted.findIndex((activity) => activity.id === nextActivity.id)
    : -1;
  const anchorIndex = findPreviewAnchorIndex(
    sorted,
    nowJapanTime,
    nowIndex,
    nextIndex,
  );
  const mustInclude = [nowIndex, nextIndex].filter((index) => index >= 0);
  const indices = selectItineraryPreviewIndices(
    sorted.length,
    anchorIndex,
    mustInclude,
  );

  return {
    items: indices.map((index) => {
      const activity = sorted[index]!;
      return toPreviewItem(
        activity,
        resolveEmphasis(activity, nowActivity, nextActivity),
      );
    }),
    overflowCount: Math.max(0, sorted.length - indices.length),
  };
}
