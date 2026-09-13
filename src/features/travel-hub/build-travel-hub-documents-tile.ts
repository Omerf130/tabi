import { buildTravelDocumentsHref } from "@/features/documents/constants";
import { TRAVEL_HUB_DOCUMENTS } from "./constants";
import type { TravelHubMaterialsTile } from "./types";

export function buildTravelHubDocumentsTile(
  tripId: string,
  documentCount: number,
): TravelHubMaterialsTile {
  const secondaryLine =
    documentCount === 0
      ? null
      : documentCount === 1
        ? TRAVEL_HUB_DOCUMENTS.countOne
        : TRAVEL_HUB_DOCUMENTS.countMany(documentCount);

  return {
    href: buildTravelDocumentsHref(tripId),
    title: TRAVEL_HUB_DOCUMENTS.title,
    primaryLine:
      documentCount === 0
        ? TRAVEL_HUB_DOCUMENTS.emptyPrimary
        : TRAVEL_HUB_DOCUMENTS.title,
    secondaryLine,
  };
}
