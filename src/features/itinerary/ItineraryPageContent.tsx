import { AppPage } from "@/features/app-shell/AppPage";
import { requireUser } from "@/features/auth/session";
import { getTranslations } from "next-intl/server";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import type { TripWorkspace } from "@/features/trips/public-trip";
import { getTodayTripLocal } from "@/features/trips/destination/trip-calendar-for-workspace";
import { getTripDayCount } from "@/features/trips/trip-days";
import { listIncompleteRemindersForUserTrip } from "@/features/trips/reminders/queries";
import { buildFocusedDayCard } from "./build-focused-day-card.server";
import { buildItineraryOverviewSummaries } from "./build-itinerary-overview";
import { DaySummaryList } from "./DaySummaryList";
import { loadItineraryTripData } from "./load-itinerary-trip-data";
import { resolveFocusedItineraryDay } from "./resolve-focused-itinerary-day";
import styles from "./ItineraryPage.module.scss";

type ItineraryPageContentProps = {
  trip: TripWorkspace;
};

export async function ItineraryPageContent({ trip }: ItineraryPageContentProps) {
  const user = await requireUser();
  const tCommon = await getTranslations("Common");
  const [tripData, incompleteReminders] = await Promise.all([
    loadItineraryTripData(trip.id, trip.startDate, trip.endDate),
    listIncompleteRemindersForUserTrip(trip.id, user.id),
  ]);

  const incompleteReminderDates = new Set(
    incompleteReminders.map((reminder) => reminder.date),
  );

  const todayTripLocal = getTodayTripLocal(trip);

  const days = buildItineraryOverviewSummaries({
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    activities: tripData.activities,
    transportsByDate: tripData.transportsByDate,
    accommodations: tripData.accommodations,
    documents: tripData.documents,
    incompleteReminderDates,
    todayTripLocal,
  });

  const focusedDate = resolveFocusedItineraryDay(
    trip.startDate,
    trip.endDate,
    todayTripLocal,
  );
  const focusedDayCard = focusedDate
    ? await buildFocusedDayCard({
        tripId: trip.id,
        focusedDate,
        startDate: trip.startDate,
        endDate: trip.endDate,
        activities: tripData.activities,
        dayTransports: tripData.transportsByDate.get(focusedDate) ?? [],
        transportRecords: tripData.transportById,
        accommodations: tripData.accommodations,
        incompleteReminderCount: incompleteReminders.filter(
          (reminder) => reminder.date === focusedDate,
        ).length,
        todayTripLocal,
        destinationCalendarTimeZone: trip.destinationCalendarTimeZone,
      })
    : null;

  const dayCount = getTripDayCount(trip.startDate, trip.endDate);

  return (
    <AppPage width="wide">
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <p className={styles.range}>
            {formatCalendarDateRangeDisplay(trip.startDate, trip.endDate)}
          </p>
          <p className={styles.summary}>{tCommon("tripDays", { count: dayCount })}</p>
        </div>
      </header>

      <DaySummaryList days={days} focusedDayCard={focusedDayCard} />
    </AppPage>
  );
}
