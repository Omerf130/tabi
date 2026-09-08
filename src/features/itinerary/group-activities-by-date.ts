import type { ActivityViewModel } from "./types";

function compareActivitiesForDay(a: ActivityViewModel, b: ActivityViewModel): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  return a.id.localeCompare(b.id);
}

export function groupActivitiesByDate(
  activities: readonly ActivityViewModel[],
): Map<string, ActivityViewModel[]> {
  const grouped = new Map<string, ActivityViewModel[]>();

  for (const activity of activities) {
    const existing = grouped.get(activity.date);
    if (existing) {
      existing.push(activity);
    } else {
      grouped.set(activity.date, [activity]);
    }
  }

  for (const [date, dayActivities] of grouped) {
    grouped.set(date, [...dayActivities].sort(compareActivitiesForDay));
  }

  return grouped;
}
