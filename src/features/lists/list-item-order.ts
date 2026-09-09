export type TripListItemOrderRecord = {
  id: string;
  order: number;
  createdAt: string | Date;
};

export function compareTripListItemsForDisplay<T extends TripListItemOrderRecord>(
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

export function sortTripListItemsForDisplay<T extends TripListItemOrderRecord>(
  items: readonly T[],
): T[] {
  return [...items].sort(compareTripListItemsForDisplay);
}

export function getNextTripListItemOrder(
  items: readonly Pick<TripListItemOrderRecord, "order">[],
): number {
  if (items.length === 0) {
    return 0;
  }

  return Math.max(...items.map((item) => item.order)) + 1;
}
