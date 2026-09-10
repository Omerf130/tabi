import type { PublicUser } from "@/features/auth/public-user";
import { MyTripsEmptyState } from "./MyTripsEmptyState";
import { MyTripsHeader } from "./MyTripsHeader";
import { TripCollectionGrid } from "./TripCollectionGrid";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type MyTripsScreenProps = {
  user: PublicUser;
  trips: MyTripsCardItem[];
};

export function MyTripsScreen({ user, trips }: MyTripsScreenProps) {
  const hasTrips = trips.length > 0;

  return (
    <div className={styles.screen} dir="ltr" lang="en">
      <MyTripsHeader userName={user.name} showNewTripAction={hasTrips} />

      <main className={hasTrips ? styles.main : `${styles.main} ${styles.mainEmpty}`}>
        <div className={styles.pageIntro}>
          <h1 className={styles.pageTitle}>My Trips</h1>
          {hasTrips ? (
            <p className={styles.pageSubtitle}>
              Your personal collection of journeys.
            </p>
          ) : null}
        </div>

        {hasTrips ? (
          <TripCollectionGrid trips={trips} />
        ) : (
          <MyTripsEmptyState />
        )}
      </main>
    </div>
  );
}
