import { revalidatePath } from "next/cache";
import { buildFinanceHref } from "./constants";

export function revalidateFinancePaths(tripId: string): void {
  revalidatePath(buildFinanceHref(tripId));
  revalidatePath(`/app/trips/${tripId}/more`);
}
