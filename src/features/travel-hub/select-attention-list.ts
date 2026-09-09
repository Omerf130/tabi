import type { TripListType } from "@/features/lists/constants";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import type { TripPhase } from "@/features/trips/trip-phase";
import {
  TRIP_ATTENTION_LIST_PRIORITIES,
  TRIP_ATTENTION_SECTION_LABELS,
} from "./constants";

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

function formatAttentionMessage(list: TripListSummaryViewModel, remainingCount: number): string {
  if (remainingCount === 1) {
    switch (list.type) {
      case "packing":
        return "נשאר פריט אחד לארוז";
      case "before_trip":
        return "נשארה מטלה אחת לפני הטיסה";
      case "during_trip":
        return "נשארה מטלה אחת במהלך הטיול";
      case "pre_trip_shopping":
        return "נשאר פריט קנייה אחד";
      default:
        return "נשאר פריט אחד";
    }
  }

  switch (list.type) {
    case "packing":
      return `נשארו ${remainingCount} דברים לארוז`;
    case "before_trip":
      return `נשארו ${remainingCount} מטלות לפני הטיסה`;
    case "during_trip":
      return `נשארו ${remainingCount} מטלות במהלך הטיול`;
    case "pre_trip_shopping":
      return `נשארו ${remainingCount} פריטי קנייה`;
    default:
      return `נשארו ${remainingCount} פריטים`;
  }
}

export function selectAttentionList(
  lists: readonly TripListSummaryViewModel[],
  tripPhase: TripPhase,
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
      sectionLabel: TRIP_ATTENTION_SECTION_LABELS[tripPhase],
      attentionMessage: formatAttentionMessage(list, remainingCount),
      remainingCount,
    };
  }

  return null;
}
