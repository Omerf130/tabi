import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TripListType } from "@/features/lists/constants";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import type { TripPhase } from "@/features/trips/trip-phase";
import { TRIP_ATTENTION_LIST_PRIORITIES } from "./constants";

export type AttentionListResult = {
  list: TripListSummaryViewModel;
  sectionLabel: string;
  attentionMessage: string;
  remainingCount: number;
};

function isListEligible(list: TripListSummaryViewModel): boolean {
  const { totalCount, completedCount } = list.progress;
  return totalCount > 0 && completedCount < totalCount;
}

function formatAttentionMessage(
  list: TripListSummaryViewModel,
  remainingCount: number,
  t: AppTranslator<"TravelHub">,
): string {
  const isOne = remainingCount === 1;

  switch (list.type) {
    case "packing":
      return isOne
        ? t("attentionMessages.packingOne")
        : t("attentionMessages.packingMany", { count: remainingCount });
    case "before_trip":
      return isOne
        ? t("attentionMessages.beforeTripOne")
        : t("attentionMessages.beforeTripMany", { count: remainingCount });
    case "during_trip":
      return isOne
        ? t("attentionMessages.duringTripOne")
        : t("attentionMessages.duringTripMany", { count: remainingCount });
    case "pre_trip_shopping":
      return isOne
        ? t("attentionMessages.preTripShoppingOne")
        : t("attentionMessages.preTripShoppingMany", { count: remainingCount });
    default:
      return isOne
        ? t("attentionMessages.defaultOne")
        : t("attentionMessages.defaultMany", { count: remainingCount });
  }
}

export function selectAttentionList(
  lists: readonly TripListSummaryViewModel[],
  tripPhase: TripPhase,
  t: AppTranslator<"TravelHub">,
): AttentionListResult | null {
  if (tripPhase === "completed") {
    return null;
  }

  const priority: readonly TripListType[] =
    TRIP_ATTENTION_LIST_PRIORITIES[tripPhase] ?? [];

  const listByType = new Map(lists.map((list) => [list.type, list]));

  for (const type of priority) {
    const list = listByType.get(type);
    if (!list || !isListEligible(list)) {
      continue;
    }

    const remainingCount = list.progress.totalCount - list.progress.completedCount;

    return {
      list,
      sectionLabel: t(`attentionSections.${tripPhase}`),
      attentionMessage: formatAttentionMessage(list, remainingCount, t),
      remainingCount,
    };
  }

  return null;
}
