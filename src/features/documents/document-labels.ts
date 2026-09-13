import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TravelDocumentCategory } from "./constants";
import type { TravelWalletVisualFilter } from "./document-filter-ui";

export type TravelDocumentCategoryLabelResolver = (
  category: TravelDocumentCategory,
) => string;

export function createTravelDocumentCategoryLabelResolver(
  t: AppTranslator<"Documents">,
): TravelDocumentCategoryLabelResolver {
  return (category) => t(`categories.${category}`);
}

export function createTravelWalletVisualFilterOptions(
  t: AppTranslator<"Documents">,
): Array<{
  value: TravelWalletVisualFilter;
  label: string;
  icon:
    | "grid"
    | "plane"
    | "bed"
    | "train"
    | "ticket"
    | "shield"
    | "more";
}> {
  return [
    { value: "all", label: t("filters.all"), icon: "grid" },
    { value: "flight", label: t("filters.flight"), icon: "plane" },
    { value: "accommodation", label: t("filters.accommodation"), icon: "bed" },
    { value: "train", label: t("filters.train"), icon: "train" },
    { value: "ticket", label: t("filters.ticket"), icon: "ticket" },
    { value: "insurance", label: t("filters.insurance"), icon: "shield" },
    { value: "more", label: t("filters.more"), icon: "more" },
  ];
}

export function formatDocumentWalletCount(
  count: number,
  t: AppTranslator<"Documents">,
): string {
  return t("walletCount", { count });
}

export function formatDocumentLinkedCount(
  count: number,
  t: AppTranslator<"Documents">,
): string {
  return t("linkedCount", { count });
}
