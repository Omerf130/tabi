import Image from "next/image";
import Link from "next/link";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import {
  MY_TRIPS_PHASE_LABELS,
  MY_TRIPS_ROLE_LABELS,
} from "./constants";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type TripCollectionCardProps = {
  trip: MyTripsCardItem;
};

export function TripCollectionCard({ trip }: TripCollectionCardProps) {
  const dateRange = formatCalendarDateRangeDisplay(
    trip.startDate,
    trip.endDate,
    "en-US",
  );
  const accessibleName = `${trip.name}, ${dateRange}`;

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
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={styles.tripCardImage}
            unoptimized={trip.hasPersistedCover}
          />
          <div className={styles.tripCardOverlay} />
        </div>

        <div className={styles.tripCardBody}>
          <div className={styles.tripCardTop}>
            <h2 className={styles.tripCardName}>{trip.name}</h2>
            <span className={styles.tripCardPhase}>
              {MY_TRIPS_PHASE_LABELS[trip.phase]}
            </span>
          </div>
          <p className={styles.tripCardDates}>{dateRange}</p>
          <p className={styles.tripCardRole}>{MY_TRIPS_ROLE_LABELS[trip.role]}</p>
        </div>
      </article>
    </Link>
  );
}
