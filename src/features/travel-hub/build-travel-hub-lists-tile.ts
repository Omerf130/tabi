import { buildListsLandingHref } from "@/features/lists/constants";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { aggregateTravelHubListsProgress } from "./aggregate-travel-hub-lists-progress";
import { TRAVEL_HUB_LISTS } from "./constants";
import type { TravelHubMaterialsTile } from "./types";

export function buildTravelHubListsTile(
  tripId: string,
  lists: readonly TripListSummaryViewModel[],
): TravelHubMaterialsTile {
  const progress = aggregateTravelHubListsProgress(lists);

  return {
    href: buildListsLandingHref(tripId),
    title: TRAVEL_HUB_LISTS.title,
    primaryLine:
      progress.totalCount === 0
        ? TRAVEL_HUB_LISTS.emptyPrimary
        : TRAVEL_HUB_LISTS.title,
    secondaryLine: progress.progressLabel,
  };
}
