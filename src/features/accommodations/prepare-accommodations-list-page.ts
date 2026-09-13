import "server-only";

import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { attachAccommodationPhotoPresentations } from "./attach-accommodation-photo-presentations";
import { buildAccommodationListItem } from "./build-accommodation-list-item";
import type {
  AccommodationListItemViewModel,
  AccommodationViewModel,
} from "./types";

export type PreparedAccommodationsListPage = {
  currentTripDate: string;
  items: AccommodationListItemViewModel[];
};

export async function prepareAccommodationsListPage(
  tripId: string,
  accommodations: readonly AccommodationViewModel[],
): Promise<PreparedAccommodationsListPage> {
  const [currentTripDate, locale] = await Promise.all([
    Promise.resolve(getJapanCalendarDate()),
    resolveRequestLocale(),
  ]);
  const t = createAppTranslator("Accommodation", locale);
  const photoPresentations = await attachAccommodationPhotoPresentations(
    tripId,
    accommodations,
  );

  const items = accommodations.map((accommodation) =>
    buildAccommodationListItem(
      tripId,
      accommodation,
      currentTripDate,
      t,
      photoPresentations.get(accommodation.id),
    ),
  );

  return {
    currentTripDate,
    items,
  };
}
