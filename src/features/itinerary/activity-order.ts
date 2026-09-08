export type ActivityOrderRecord = {
  id: string;
  order: number;
  createdAt: string | Date;
};

export function compareActivitiesForDisplay<T extends ActivityOrderRecord>(
  a: T,
  b: T,
): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }

  const aCreated = new Date(a.createdAt).getTime();
  const bCreated = new Date(b.createdAt).getTime();
  if (aCreated !== bCreated) {
    return aCreated - bCreated;
  }

  return a.id.localeCompare(b.id);
}

export function sortActivitiesForDisplay<T extends ActivityOrderRecord>(
  activities: readonly T[],
): T[] {
  return [...activities].sort(compareActivitiesForDisplay);
}

export function getNextActivityOrder(
  activities: readonly Pick<ActivityOrderRecord, "order">[],
): number {
  if (activities.length === 0) {
    return 0;
  }

  return Math.max(...activities.map((activity) => activity.order)) + 1;
}

export function getReorderNeighborId(
  activities: readonly ActivityOrderRecord[],
  activityId: string,
  direction: "up" | "down",
): string | null {
  const sorted = sortActivitiesForDisplay(activities);
  const index = sorted.findIndex((activity) => activity.id === activityId);
  if (index === -1) {
    return null;
  }

  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= sorted.length) {
    return null;
  }

  return sorted[neighborIndex]?.id ?? null;
}
