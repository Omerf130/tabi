import { isAccommodationOccupiedOnDate } from "@/features/accommodations/accommodation-domain";
import type { TravelDocumentContextLink } from "@/features/documents/types";

export type DocumentDayLinkContext = {
  contextLink?: TravelDocumentContextLink;
  accommodationCheckIn?: string;
  accommodationCheckOut?: string;
  transportDepartureDate?: string;
};

export function resolveDocumentDayRelevance(
  document: DocumentDayLinkContext,
  date: string,
): boolean {
  const link = document.contextLink;
  if (!link) {
    return false;
  }

  if (link.type === "activity") {
    return link.date === date;
  }

  if (link.type === "transport") {
    return Boolean(
      document.transportDepartureDate && document.transportDepartureDate === date,
    );
  }

  if (link.type === "accommodation") {
    if (!document.accommodationCheckIn || !document.accommodationCheckOut) {
      return false;
    }
    return isAccommodationOccupiedOnDate(
      document.accommodationCheckIn,
      document.accommodationCheckOut,
      date,
    );
  }

  return false;
}
