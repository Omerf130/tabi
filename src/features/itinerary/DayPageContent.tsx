import { AppPage } from "@/features/app-shell/AppPage";
import { requireUser } from "@/features/auth/session";
import type { TripWorkspace } from "@/features/trips/public-trip";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { listTransportsForItineraryDay } from "@/features/transport/queries";
import { listRemindersForUserTripDay } from "@/features/trips/reminders/queries";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { attachActivityPhotoPresentations } from "./attach-activity-photo-presentations";
import { buildDayDocumentLinkOptions } from "./build-day-document-link-options";
import { buildDayWorkspaceViewModel } from "./build-day-workspace";
import { buildItineraryDayStrip } from "./build-itinerary-day-strip";
import { buildItineraryHero } from "./build-itinerary-hero";
import { loadItineraryTripData } from "./load-itinerary-trip-data";
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
  const todayJapan = getJapanCalendarDate();
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
      listRemindersForUserTripDay(trip.id, user.id, validatedDate, todayJapan),
      trip.role === "owner"
        ? prepareEntityCostFormContext(trip.id)
        : Promise.resolve(null),
    ]);

  const [photoPresentations, dayHeaderContext] = await Promise.all([
    attachActivityPhotoPresentations(trip.id, activities),
    resolveDayHeaderContext({
      date: validatedDate,
      dayNumber: 0,
      weekdayLabel: "",
      dateLabel: "",
      isToday: validatedDate === todayJapan,
      activities,
      transports,
      accommodations: tripData.accommodations,
      transportRecords: tripData.transportById,
    }),
  ]);

  const day = buildDayWorkspaceViewModel({
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    date: validatedDate,
    isOwner: trip.role === "owner",
    activities,
    transports,
    accommodations: tripData.accommodations,
    documents: tripData.documents,
    reminders,
    todayJapan,
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

  const hero = buildItineraryHero({ trip });
  const dayStrip = buildItineraryDayStrip({
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    selectedDate: validatedDate,
    todayJapan,
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
          />
        </div>
      </div>
    </AppPage>
  );
}
