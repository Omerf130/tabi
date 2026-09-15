import { revalidatePath } from "next/cache";
import type { TripManagementSection } from "./constants";

export function revalidateTripManagement(
  tripId: string,
  section?: TripManagementSection,
): void {
  revalidatePath(`/app/trips/${tripId}/manage`);
  revalidatePath(`/app/trips/${tripId}/manage/language`);
  revalidatePath(`/app/trips/${tripId}/manage/details`);
  revalidatePath(`/app/trips/${tripId}/manage/members`);
  if (section) {
    revalidatePath(`/app/trips/${tripId}/manage/${section}`);
  }
  revalidatePath(`/app/trips/${tripId}/settings`);
}
