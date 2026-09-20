import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TransportType } from "./transport-types";
import type { TrainCategory } from "./transport-types";
import type { TransportListFilter } from "./filter-transport-list";

export function createTransportTypeLabelResolver(t: AppTranslator<"Transport">) {
  return (type: TransportType) => t(`types.${type}`);
}

export function createTransportTypeSingularLabelResolver(
  t: AppTranslator<"Transport">,
) {
  return (type: TransportType) => t(`typesSingular.${type}`);
}

export function createTrainCategoryLabelResolver(
  t: AppTranslator<"Transport">,
  destinationCountryCode?: string | null,
) {
  const isJapanTrip = destinationCountryCode?.trim().toUpperCase() === "JP";
  return (category: TrainCategory) => {
    if (category === "shinkansen" && !isJapanTrip) {
      return t("trainCategories.shinkansenHighSpeed");
    }
    return t(`trainCategories.${category}`);
  };
}

export function getTransportFilterEmptyMessageKey(
  filter: TransportListFilter,
): "emptyAll" | "emptyFlight" | "emptyTrain" | "emptyOther" {
  switch (filter) {
    case "all":
      return "emptyAll";
    case "flight":
      return "emptyFlight";
    case "train":
      return "emptyTrain";
    case "other":
      return "emptyOther";
  }
}

export function createTransportFilterTabs(t: AppTranslator<"Transport">) {
  return (
    [
      { id: "all", label: t("filters.all") },
      { id: "flight", label: t("filters.flight") },
      { id: "train", label: t("filters.train") },
      { id: "other", label: t("filters.other") },
    ] as const
  ).map((tab) => ({ ...tab }));
}

export function formatTransportFilterTabLabel(
  filter: TransportListFilter,
  count: number,
  t: AppTranslator<"Transport">,
): string {
  const label = t(`filters.${filter}`);
  return t("filterTab", { label, count });
}
