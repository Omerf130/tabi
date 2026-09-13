import { buildTravelDocumentsHref } from "@/features/documents/constants";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TravelHubMaterialsTile } from "./types";

export function buildTravelHubDocumentsTile(
  tripId: string,
  documentCount: number,
  t: AppTranslator<"TravelHub">,
): TravelHubMaterialsTile {
  const secondaryLine =
    documentCount === 0
      ? null
      : documentCount === 1
        ? t("documentsCountOne")
        : t("documentsCountMany", { count: documentCount });

  return {
    href: buildTravelDocumentsHref(tripId),
    title: t("documentsTitle"),
    primaryLine:
      documentCount === 0 ? t("documentsEmptyPrimary") : t("documentsTitle"),
    secondaryLine,
  };
}
