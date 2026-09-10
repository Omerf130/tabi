import { isAccommodationOccupiedOnDate } from "@/features/accommodations/accommodation-domain";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { toDocumentDayRelevanceInput } from "@/features/documents/resolve-travel-documents-batch";
import type { ResolvedTravelDocumentViewModel } from "@/features/documents/types";
import { mergeItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import {
  formatTripDayDateLabel,
  formatTripDayHeading,
  formatTripDayWeekday,
  getInclusiveDateRange,
  getTripDayNumber,
  getTripDayTemporalState,
} from "@/features/trips/trip-days";
import { resolveDocumentDayRelevance } from "./day-document-relevance";
import { getAdjacentTripDates, buildItineraryOverviewHref } from "./routes";
import type { ActivityViewModel, DayWorkspaceViewModel } from "./types";

type BuildDayWorkspaceInput = {
  tripId: string;
  startDate: string;
  endDate: string;
  date: string;
  isOwner: boolean;
  activities: readonly ActivityViewModel[];
  transports: readonly TransportItineraryItemViewModel[];
  accommodations: readonly AccommodationViewModel[];
  documents: readonly ResolvedTravelDocumentViewModel[];
  reminders: readonly TripReminderViewModel[];
  todayJapan?: string;
};

function filterDocumentsForDay(
  documents: readonly ResolvedTravelDocumentViewModel[],
  date: string,
): ResolvedTravelDocumentViewModel[] {
  return documents.filter((document) =>
    resolveDocumentDayRelevance(toDocumentDayRelevanceInput(document), date),
  );
}

function filterOccupiedAccommodations(
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

export function buildDayWorkspaceViewModel({
  tripId,
  startDate,
  endDate,
  date,
  isOwner,
  activities,
  transports,
  accommodations,
  documents,
  reminders,
  todayJapan = getJapanCalendarDate(),
}: BuildDayWorkspaceInput): DayWorkspaceViewModel {
  const tripDates = getInclusiveDateRange(startDate, endDate);
  const { previousDate, nextDate } = getAdjacentTripDates(tripDates, date);
  const items = mergeItineraryDayItems(activities, transports);
  const incompleteReminders = reminders.filter((reminder) => !reminder.isCompleted);
  const completedReminders = reminders.filter((reminder) => reminder.isCompleted);

  return {
    date,
    dayNumber: getTripDayNumber(startDate, endDate, date)!,
    weekdayLabel: formatTripDayWeekday(date),
    dateLabel: formatTripDayDateLabel(date),
    headingLabel: formatTripDayHeading(date),
    temporalState: getTripDayTemporalState(date, todayJapan),
    previousDate,
    nextDate,
    overviewHref: buildItineraryOverviewHref(tripId),
    accommodations: filterOccupiedAccommodations(accommodations, date),
    items,
    activities: [...activities],
    transports: [...transports],
    documents: filterDocumentsForDay(documents, date),
    incompleteReminders,
    completedReminders,
    tripDates,
    isOwner,
  };
}
