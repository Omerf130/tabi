import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateTripTravelLanguageSurfaces(tripId: string): void {
  revalidatePath(`/app/trips/${tripId}`);
  revalidatePath(`/app/trips/${tripId}/language`);
  revalidatePath(`/app/trips/${tripId}/manage/language`);
  revalidatePath(`/app/trips/${tripId}/manage`);
}
