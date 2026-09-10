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
import type { CurrencyOption } from "@/features/currency/types";
import type {
  ActivityViewModel,
  DayWorkspaceViewModel,
  ItineraryDayHeaderViewModel,
} from "./types";

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
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
  dayHeader?: Pick<
    ItineraryDayHeaderViewModel,
    "locationLabel" | "weather" | "accommodationContext"
  >;
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
  financeBaseCurrency = "ILS",
  currencies = [],
  dayHeader,
}: BuildDayWorkspaceInput): DayWorkspaceViewModel {
  const tripDates = getInclusiveDateRange(startDate, endDate);
  const { previousDate, nextDate } = getAdjacentTripDates(tripDates, date);
  const items = mergeItineraryDayItems(activities, transports);
  const incompleteReminders = reminders.filter((reminder) => !reminder.isCompleted);
  const completedReminders = reminders.filter((reminder) => reminder.isCompleted);
  const dayNumber = getTripDayNumber(startDate, endDate, date)!;
  const weekdayLabel = formatTripDayWeekday(date);
  const dateLabel = formatTripDayDateLabel(date);
  const temporalState = getTripDayTemporalState(date, todayJapan);

  return {
    date,
    dayNumber,
    weekdayLabel,
    dateLabel,
    headingLabel: formatTripDayHeading(date),
    temporalState,
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
    financeBaseCurrency,
    currencies,
    dayHeader: {
      dayNumber,
      weekdayLabel,
      dateLabel,
      isToday: temporalState === "today",
      locationLabel: dayHeader?.locationLabel,
      weather: dayHeader?.weather,
      accommodationContext: dayHeader?.accommodationContext,
    },
  };
}
