import { revalidatePath } from "next/cache";

export function revalidateTripThemeSurfaces(tripId: string): void {
  revalidatePath(`/app/trips/${tripId}`, "layout");
  revalidatePath(`/app/trips/${tripId}/manage`);
  revalidatePath(`/app/trips/${tripId}/manage/appearance`);
}
