import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { EmergencyCustomCategory } from "./types";

export function createEmergencyCategoryLabelResolver(
  t: AppTranslator<"Emergency">,
) {
  return (category: EmergencyCustomCategory) =>
    t(`categories.${category}`);
}
