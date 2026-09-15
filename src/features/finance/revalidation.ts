import { revalidatePath } from "next/cache";
import { buildCurrencySettingsHref } from "@/features/settings/constants";
import { buildFinanceHref } from "./constants";

export function revalidateFinancePaths(tripId: string): void {
  revalidatePath(buildFinanceHref(tripId));
  revalidatePath(buildCurrencySettingsHref(tripId));
  revalidatePath(`/app/trips/${tripId}/more`);
}
