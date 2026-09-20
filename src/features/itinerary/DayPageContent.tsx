import { AppPage } from "@/features/app-shell/AppPage";
import { requireUser } from "@/features/auth/session";
import { getTranslations } from "next-intl/server";
import type { TripWorkspace } from "@/features/trips/public-trip";
import { dayWeatherTripDestinationFromWorkspace } from "@/features/trips/destination/day-weather-trip-destination";
import { getTodayTripLocal } from "@/features/trips/destination/trip-calendar-for-workspace";
import { listTransportsForItineraryDay } from "@/features/transport/queries";
import { listRemindersForUserTripDay } from "@/features/trips/reminders/queries";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { attachActivityPhotoPresentations } from "./attach-activity-photo-presentations";
import { buildDayDocumentLinkOptions } from "./build-day-document-link-options";
import { buildDayWorkspaceViewModel } from "./build-day-workspace";
import { buildItineraryDayStrip } from "./build-itinerary-day-strip";
import { buildItineraryHero } from "./build-itinerary-hero";
import { loadItineraryTripData } from "./load-itinerary-trip-data";
import { withActivityNavigationHrefs } from "@/lib/maps/navigation-entities";
import { listActivitiesForTripDay } from "./queries";
import { parseItineraryDateParam } from "./routes";
import { resolveDayHeaderContext } from "./resolve-day-header-context.server";
import { DayPageShell } from "./DayPageShell.client";
import { ItineraryDayHeader } from "./ItineraryDayHeader";
import { ItineraryDayStrip } from "./ItineraryDayStrip.client";
import { ItineraryHero } from "./ItineraryHero";
import styles from "./ItineraryExperience.module.scss";

type DayPageContentProps = {
  trip: TripWorkspace;
  date: string;
};

function toActivityPhotoMap(
  presentations: Awaited<ReturnType<typeof attachActivityPhotoPresentations>>,
): Record<string, string> {
  const photos: Record<string, string> = {};

  for (const [activityId, presentation] of presentations.entries()) {
    if (presentation.hasPhoto && presentation.photoHref) {
      photos[activityId] = presentation.photoHref;
    }
  }

  return photos;
}

export async function DayPageContent({ trip, date }: DayPageContentProps) {
  const user = await requireUser();
  const tItinerary = await getTranslations("Itinerary");
  const todayTripLocal = getTodayTripLocal(trip);
  const validatedDate = parseItineraryDateParam(date, trip.startDate, trip.endDate);
  if (!validatedDate) {
    return null;
  }

  const [activities, transports, tripData, reminders, financeContext] =
    await Promise.all([
      listActivitiesForTripDay(trip.id, validatedDate),
      listTransportsForItineraryDay(
        trip.id,
        validatedDate,
        trip.startDate,
        trip.endDate,
      ),
      loadItineraryTripData(trip.id, trip.startDate, trip.endDate),
      listRemindersForUserTripDay(trip.id, user.id, validatedDate, todayTripLocal),
      trip.role === "owner"
        ? prepareEntityCostFormContext(trip.id)
        : Promise.resolve(null),
    ]);

  const activitiesWithNavigation = withActivityNavigationHrefs(
    activities,
    user.preferredMapsApp,
  );

  const [photoPresentations, dayHeaderContext] = await Promise.all([
    attachActivityPhotoPresentations(trip.id, activitiesWithNavigation),
    resolveDayHeaderContext({
      date: validatedDate,
      dayNumber: 0,
      weekdayLabel: "",
      dateLabel: "",
      isToday: validatedDate === todayTripLocal,
      activities: activitiesWithNavigation,
      transports,
      accommodations: tripData.accommodations,
      transportRecords: tripData.transportById,
      tripDestination: dayWeatherTripDestinationFromWorkspace(trip),
      t: tItinerary,
    }),
  ]);

  const day = buildDayWorkspaceViewModel({
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    date: validatedDate,
    isOwner: trip.role === "owner",
    activities: activitiesWithNavigation,
    transports,
    accommodations: tripData.accommodations,
    documents: tripData.documents,
    reminders,
    todayTripLocal,
    financeBaseCurrency: financeContext?.baseCurrency ?? "ILS",
    currencies: financeContext?.currencies ?? [],
    dayHeader: dayHeaderContext,
  });

  const documentLinkOptions = buildDayDocumentLinkOptions(
    validatedDate,
    day.activities,
    day.transports,
    day.accommodations,
  );

  const hero = buildItineraryHero({ trip }, tItinerary);
  const dayStrip = buildItineraryDayStrip({
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    selectedDate: validatedDate,
    todayTripLocal,
  });
  const activityPhotos = toActivityPhotoMap(photoPresentations);

  return (
    <AppPage width="wide">
      <div className={styles.experience}>
        <ItineraryHero hero={hero} />
        <div className={styles.surface}>
          <ItineraryDayStrip days={dayStrip} />
          <ItineraryDayHeader header={day.dayHeader} />
          <DayPageShell
            tripId={trip.id}
            startDate={trip.startDate}
            endDate={trip.endDate}
            day={day}
            documentLinkOptions={documentLinkOptions}
            transportRecords={tripData.transportById}
            activityPhotos={activityPhotos}
            destinationCalendarTimeZone={trip.destinationCalendarTimeZone}
            destinationCountryCode={trip.destination?.countryCode}
          />
        </div>
      </div>
    </AppPage>
  );
}
