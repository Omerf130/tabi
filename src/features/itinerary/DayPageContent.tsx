import Link from "next/link";
import { AppPage } from "@/features/app-shell/AppPage";
import { Badge } from "@/components/ui/Badge/Badge";
import { IconChevron } from "@/components/ui/icons";
import { requireUser } from "@/features/auth/session";
import type { TripWorkspace } from "@/features/trips/public-trip";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getAccommodationsSettingsHref } from "@/features/accommodations/constants";
import { listTransportsForItineraryDay } from "@/features/transport/queries";
import { listRemindersForUserTripDay } from "@/features/trips/reminders/queries";
import { buildDayDocumentLinkOptions } from "./build-day-document-link-options";
import { buildDayWorkspaceViewModel } from "./build-day-workspace";
import { loadItineraryTripData } from "./load-itinerary-trip-data";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { listActivitiesForTripDay } from "./queries";
import { buildItineraryDayHref, parseItineraryDateParam } from "./routes";
import { DayPageShell } from "./DayPageShell.client";
import styles from "./DayPage.module.scss";

type DayPageContentProps = {
  trip: TripWorkspace;
  date: string;
};

function getTemporalLabel(state: "past" | "today" | "future"): string | null {
  if (state === "today") {
    return "היום";
  }
  if (state === "past") {
    return "עבר";
  }
  return null;
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
  });

  const documentLinkOptions = buildDayDocumentLinkOptions(
    validatedDate,
    day.activities,
    day.transports,
    day.accommodations,
  );

  const temporalLabel = getTemporalLabel(day.temporalState);

  return (
    <AppPage width="wide">
      <header className={styles.header}>
        <div className={styles.headerNav}>
          <Link href={day.overviewHref} className={styles.backLink}>
            מסלול
          </Link>
          <div className={styles.dayNav}>
            {day.previousDate ? (
              <Link
                href={buildItineraryDayHref(trip.id, day.previousDate)}
                className={styles.adjacentDayLink}
              >
                <IconChevron className={styles.prevChevron} aria-hidden />
                <span className={styles.srOnly}>יום קודם</span>
              </Link>
            ) : (
              <span className={styles.adjacentDaySpacer} />
            )}
            {day.nextDate ? (
              <Link
                href={buildItineraryDayHref(trip.id, day.nextDate)}
                className={styles.adjacentDayLink}
              >
                <span className={styles.srOnly}>יום הבא</span>
                <IconChevron className={styles.nextChevron} aria-hidden />
              </Link>
            ) : (
              <span className={styles.adjacentDaySpacer} />
            )}
          </div>
        </div>

        <div className={styles.headerIdentity}>
          <h1 className={styles.dayNumber}>יום {day.dayNumber}</h1>
          <p className={styles.dayMeta}>
            {day.weekdayLabel}, {day.dateLabel}
          </p>
          {day.temporalState === "today" ? (
            <Badge tone="accent">היום</Badge>
          ) : temporalLabel ? (
            <span className={styles.temporalHint}>{temporalLabel}</span>
          ) : null}
        </div>
      </header>

      <section className={styles.section} aria-labelledby="day-accommodation-title">
        <h2 id="day-accommodation-title" className={styles.sectionTitle}>
          לינה
        </h2>
        {day.accommodations.length > 0 ? (
          <>
            <ul className={styles.accommodationList}>
              {day.accommodations.map((accommodation) => (
                <li key={accommodation.id}>
                  <Link
                    href={`/app/trips/${trip.id}/accommodations/${accommodation.id}`}
                    className={styles.accommodationLink}
                  >
                    <span className={styles.accommodationName} dir="auto">
                      {accommodation.name}
                    </span>
                    <span className={styles.accommodationMeta}>
                      {accommodation.city} · {accommodation.dateRangeLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {day.isOwner ? (
              <Link
                href={getAccommodationsSettingsHref(trip.id)}
                className={styles.accommodationManageLink}
              >
                {day.accommodations.length === 1
                  ? "ניהול מקום הלינה"
                  : "ניהול מקומות לינה"}
              </Link>
            ) : null}
          </>
        ) : (
          <>
            <p className={styles.emptyState}>אין מקום לינה שמוגדר ליום הזה</p>
            {day.isOwner ? (
              <Link
                href={getAccommodationsSettingsHref(trip.id)}
                className={styles.accommodationManageLink}
              >
                ניהול מקומות לינה
              </Link>
            ) : null}
          </>
        )}
      </section>

      <DayPageShell
        tripId={trip.id}
        startDate={trip.startDate}
        endDate={trip.endDate}
        day={day}
        documentLinkOptions={documentLinkOptions}
        transportRecords={tripData.transportById}
      />
    </AppPage>
  );
}
