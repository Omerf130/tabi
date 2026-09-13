import { buildListsLandingHref } from "@/features/lists/constants";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { aggregateTravelHubListsProgress } from "./aggregate-travel-hub-lists-progress";
import type { TravelHubMaterialsTile } from "./types";

export function buildTravelHubListsTile(
  tripId: string,
  lists: readonly TripListSummaryViewModel[],
  t: AppTranslator<"TravelHub">,
  tLists: AppTranslator<"Lists">,
): TravelHubMaterialsTile {
  const progress = aggregateTravelHubListsProgress(lists, (values) =>
    tLists("progressLabel", values),
  );

  return {
    href: buildListsLandingHref(tripId),
    title: t("listsTitle"),
    primaryLine: progress.totalCount === 0 ? t("listsEmptyPrimary") : t("listsTitle"),
    secondaryLine: progress.progressLabel,
  };
}
