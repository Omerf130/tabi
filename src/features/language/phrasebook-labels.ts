import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { PhrasebookCategory } from "./types";

export function createPhrasebookCategoryLabelResolver(
  t: AppTranslator<"Language">,
) {
  return (category: PhrasebookCategory) => t(`categories.${category}`);
}
