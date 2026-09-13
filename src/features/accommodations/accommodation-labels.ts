import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { AccommodationListFilter } from "./filter-accommodation-list";

export function getAccommodationFilterEmptyMessageKey(
  filter: AccommodationListFilter,
): "emptyAll" | "emptyUpcoming" | "emptyPast" {
  switch (filter) {
    case "all":
      return "emptyAll";
    case "upcoming":
      return "emptyUpcoming";
    case "past":
      return "emptyPast";
  }
}

export function createAccommodationFilterTabs(t: AppTranslator<"Accommodation">) {
  return (
    [
      { id: "all", label: t("filters.all") },
      { id: "upcoming", label: t("filters.upcoming") },
      { id: "past", label: t("filters.past") },
    ] as const
  ).map((tab) => ({ ...tab }));
}

export function formatAccommodationFilterTabLabel(
  filter: AccommodationListFilter,
  count: number,
  t: AppTranslator<"Accommodation">,
): string {
  const label = t(`filters.${filter}`);
  return t("filterTab", { label, count });
}

export function formatAccommodationDeleteConfirm(t: AppTranslator<"Accommodation">): string {
  return `${t("errors.deleteConfirm")}\n\n${t("errors.deleteConfirmDetail")}`;
}
