import { AppPage } from "@/features/app-shell/AppPage";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import type { TripWorkspace } from "@/features/trips/public-trip";
import { getInclusiveDateRange, getTripDayCount } from "@/features/trips/trip-days";
import { listTransportsForItineraryTrip } from "@/features/transport/queries";
import { buildItineraryDaysForTrip } from "./build-itinerary-days";
import { ItineraryDayAccordion } from "./ItineraryDayAccordion";
import { listActivitiesForTrip } from "./queries";
import { resolveInitialItineraryDay } from "./resolve-initial-itinerary-day";
import styles from "./ItineraryPage.module.scss";

type ItineraryPageContentProps = {
  trip: TripWorkspace;
  requestedDate?: string | null;
};

export async function ItineraryPageContent({
  trip,
  requestedDate,
}: ItineraryPageContentProps) {
  const [activities, transportsByDate] = await Promise.all([
    listActivitiesForTrip(trip.id),
    listTransportsForItineraryTrip(trip.id, trip.startDate, trip.endDate),
  ]);
  const days = buildItineraryDaysForTrip(trip, activities, transportsByDate);
  const dayCount = getTripDayCount(trip.startDate, trip.endDate);
  const tripDates = getInclusiveDateRange(trip.startDate, trip.endDate);
  const initialExpandedDate = resolveInitialItineraryDay(trip, requestedDate);
  const isOwner = trip.role === "owner";

  return (
    <AppPage width="wide">
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <p className={styles.range}>
            {formatCalendarDateRangeDisplay(trip.startDate, trip.endDate)}
          </p>
          <p className={styles.summary}>{dayCount} ימים</p>
        </div>
      </header>

      <ItineraryDayAccordion
        days={days}
        tripId={trip.id}
        tripDates={tripDates}
        isOwner={isOwner}
        initialExpandedDate={initialExpandedDate}
      />
    </AppPage>
  );
}
