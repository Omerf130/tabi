import { revalidatePath } from "next/cache";

export function revalidateItineraryPaths(
  tripId: string,
  dates: readonly string[] = [],
): void {
  revalidatePath(`/app/trips/${tripId}/itinerary`);

  for (const date of new Set(dates.filter(Boolean))) {
    revalidatePath(`/app/trips/${tripId}/itinerary/${date}`);
  }
}
