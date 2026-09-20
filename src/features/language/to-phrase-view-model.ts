import { createPhrasebookCategoryLabelResolver } from "./phrasebook-labels";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { PhrasebookCategory } from "./types";

export function createPhrasebookCategoryLabels(
  t: AppTranslator<"Language">,
): Record<PhrasebookCategory, string> {
  const getCategoryLabel = createPhrasebookCategoryLabelResolver(t);
  return {
    basics: getCategoryLabel("basics"),
    restaurants: getCategoryLabel("restaurants"),
    transport: getCategoryLabel("transport"),
    hotel: getCategoryLabel("hotel"),
    shopping: getCategoryLabel("shopping"),
    directions: getCategoryLabel("directions"),
    emergency: getCategoryLabel("emergency"),
    numbers_time: getCategoryLabel("numbers_time"),
  };
}
