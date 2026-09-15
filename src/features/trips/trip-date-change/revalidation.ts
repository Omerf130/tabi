import { revalidatePath } from "next/cache";
import { revalidateFinancePaths } from "@/features/finance/revalidation";
import { revalidateItineraryPaths } from "@/features/itinerary/revalidation";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";

export function revalidateTripDateChangeSurfaces(
  tripId: string,
  itineraryDates: readonly string[] = [],
): void {
  revalidateTripManagement(tripId, "details");
  revalidatePath(`/app/trips/${tripId}`);
  revalidatePath("/app");
  revalidateItineraryPaths(tripId, itineraryDates);
  revalidatePath(`/app/trips/${tripId}/more`);
  revalidatePath(`/app/trips/${tripId}/accommodations`);
  revalidatePath(`/app/trips/${tripId}/transport`);
  revalidatePath(`/app/trips/${tripId}/documents`);
  revalidateFinancePaths(tripId);
}
