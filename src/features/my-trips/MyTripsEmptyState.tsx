import Link from "next/link";
import { CREATE_TRIP_PATH, MY_TRIPS_EMPTY_COPY } from "./constants";
import type { MyTripsFilter } from "./filter-my-trips";
import styles from "./MyTripsScreen.module.scss";

type MyTripsEmptyStateProps = {
  filter: MyTripsFilter;
  hasAnyTrips: boolean;
};

export function MyTripsEmptyState({ filter, hasAnyTrips }: MyTripsEmptyStateProps) {
  const copy = MY_TRIPS_EMPTY_COPY[filter];
  const titleId = `my-trips-empty-${filter}`;

  return (
    <section
      className={styles.emptyState}
      aria-labelledby={titleId}
      data-has-trips={hasAnyTrips ? "true" : "false"}
    >
      <div className={styles.emptyIcon} aria-hidden="true">
        <svg viewBox="0 0 64 64" className={styles.emptyIconSvg}>
          <rect x="12" y="24" width="40" height="28" rx="4" fill="currentColor" opacity="0.12" />
          <path
            d="M20 24 L32 14 L44 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
          <path
            d="M18 52 L46 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.28"
          />
        </svg>
      </div>

      <div className={styles.emptyCopy}>
        <h2 id={titleId} className={styles.emptyTitle}>
          {copy.title}
        </h2>
        <p className={styles.emptyBody}>{copy.body}</p>
        {copy.cta ? (
          <Link href={CREATE_TRIP_PATH} className={styles.emptyCta}>
            {copy.cta}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
