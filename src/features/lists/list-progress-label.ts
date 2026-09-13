import type { TripListProgress } from "./types";

export function formatListProgressLabel(
  progress: TripListProgress,
  translate: (values: { completed: number; total: number }) => string,
): string {
  return translate({
    completed: progress.completedCount,
    total: progress.totalCount,
  });
}
