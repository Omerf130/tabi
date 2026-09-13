import Image from "next/image";
import Link from "next/link";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import { getTripDayCount } from "@/features/trips/trip-days";
import { MY_TRIPS_PHASE_LABELS } from "./constants";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type TripCollectionCardProps = {
  trip: MyTripsCardItem;
};

function formatDurationLabel(startDate: string, endDate: string): string {
  const dayCount = getTripDayCount(startDate, endDate);
  return dayCount === 1 ? "1 day" : `${dayCount} days`;
}

export function TripCollectionCard({ trip }: TripCollectionCardProps) {
  const dateRange = formatCalendarDateRangeDisplay(
    trip.startDate,
    trip.endDate,
    "en-US",
  );
  const durationLabel = formatDurationLabel(trip.startDate, trip.endDate);
  const accessibleName = `${trip.name}, ${dateRange}, ${durationLabel}`;

  return (
    <Link
      href={`/app/trips/${trip.id}`}
      className={styles.tripCardLink}
      aria-label={accessibleName}
    >
      <article className={styles.tripCard} data-phase={trip.phase}>
        <div className={styles.tripCardMedia}>
          <Image
            src={trip.imageSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 50vw, 100vw"
            className={styles.tripCardImage}
            unoptimized={trip.hasPersistedCover}
          />
          <div className={styles.tripCardOverlay} />

          <div className={styles.tripCardContent}>
            <div className={styles.tripCardMain}>
              <h2 className={styles.tripCardName}>{trip.name}</h2>
              <p className={styles.tripCardDates}>{dateRange}</p>
              <p className={styles.tripCardMeta}>{durationLabel}</p>
            </div>

            <div className={styles.tripCardActions}>
              {trip.phase === "active" ? (
                <span className={styles.tripCardActiveBadge}>
                  {MY_TRIPS_PHASE_LABELS.active}
                </span>
              ) : null}
              <span className={styles.tripCardChevron} aria-hidden="true">
                ›
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
