import { isAccommodationOccupiedOnDate } from "@/features/accommodations/accommodation-domain";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { toDocumentDayRelevanceInput } from "@/features/documents/resolve-travel-documents-batch";
import type { ResolvedTravelDocumentViewModel } from "@/features/documents/types";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import {
  formatTripDayDateLabel,
  formatTripDayWeekday,
  getInclusiveDateRange,
  getTripDayNumber,
  getTripDayTemporalState,
} from "@/features/trips/trip-days";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import { resolveDocumentDayRelevance } from "./day-document-relevance";
import { groupActivitiesByDate } from "./group-activities-by-date";
import { buildItineraryDayHref } from "./routes";
import type { ActivityViewModel, DaySummaryViewModel } from "./types";

type BuildItineraryOverviewInput = {
  tripId: string;
  startDate: string;
  endDate: string;
  activities: readonly ActivityViewModel[];
  transportsByDate: ReadonlyMap<string, readonly TransportItineraryItemViewModel[]>;
  accommodations: readonly AccommodationViewModel[];
  documents: readonly ResolvedTravelDocumentViewModel[];
  incompleteReminderDates: ReadonlySet<string>;
  todayJapan?: string;
};

function getOccupiedAccommodations(
  accommodations: readonly AccommodationViewModel[],
  date: string,
): AccommodationViewModel[] {
  return accommodations.filter((accommodation) =>
    isAccommodationOccupiedOnDate(
      accommodation.checkInDate,
      accommodation.checkOutDate,
      date,
    ),
  );
}

function countDocumentsForDay(
  documents: readonly ResolvedTravelDocumentViewModel[],
  date: string,
): number {
  let count = 0;
  for (const document of documents) {
    if (resolveDocumentDayRelevance(toDocumentDayRelevanceInput(document), date)) {
      count += 1;
    }
  }
  return count;
}

export function buildItineraryOverviewSummaries({
  tripId,
  startDate,
  endDate,
  activities,
  transportsByDate,
  accommodations,
  documents,
  incompleteReminderDates,
  todayJapan = getJapanCalendarDate(),
}: BuildItineraryOverviewInput): DaySummaryViewModel[] {
  const dates = getInclusiveDateRange(startDate, endDate);
  const activitiesByDate = groupActivitiesByDate(activities);

  return dates.map((date) => {
    const dayActivities = activitiesByDate.get(date) ?? [];
    const dayTransports = transportsByDate.get(date) ?? [];
    const occupiedAccommodations = getOccupiedAccommodations(accommodations, date);

    return {
      date,
      dayNumber: getTripDayNumber(startDate, endDate, date)!,
      weekdayLabel: formatTripDayWeekday(date),
      dateLabel: formatTripDayDateLabel(date),
      temporalState: getTripDayTemporalState(date, todayJapan),
      href: buildItineraryDayHref(tripId, date),
      accommodationLabel: occupiedAccommodations[0]?.name,
      activityCount: dayActivities.length,
      transportCount: dayTransports.length,
      documentCount: countDocumentsForDay(documents, date),
      hasIncompleteReminder: incompleteReminderDates.has(date),
      activityPreview: dayActivities[0]?.title,
      transportPreview: dayTransports[0]?.routeLabel,
    };
  });
}
