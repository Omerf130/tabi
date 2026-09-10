import { revalidatePath } from "next/cache";
import type { TripManagementSection } from "./constants";

export function revalidateTripManagement(
  tripId: string,
  section?: TripManagementSection,
): void {
  revalidatePath(`/app/trips/${tripId}/manage`);
  revalidatePath(`/app/trips/${tripId}/manage/details`);
  if (section) {
    revalidatePath(`/app/trips/${tripId}/manage/${section}`);
  }
  revalidatePath(`/app/trips/${tripId}/settings`);
}
