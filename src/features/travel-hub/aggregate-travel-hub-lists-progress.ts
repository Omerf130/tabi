import type { TripListSummaryViewModel } from "@/features/lists/types";

export type TravelHubListsProgress = {
  totalCount: number;
  completedCount: number;
  progressLabel: string | null;
};

export function aggregateTravelHubListsProgress(
  lists: readonly TripListSummaryViewModel[],
): TravelHubListsProgress {
  const totalCount = lists.reduce((sum, list) => sum + list.progress.totalCount, 0);
  const completedCount = lists.reduce(
    (sum, list) => sum + list.progress.completedCount,
    0,
  );

  return {
    totalCount,
    completedCount,
    progressLabel:
      totalCount > 0 ? `${completedCount} מתוך ${totalCount} הושלמו` : null,
  };
}
