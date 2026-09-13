import { TripCollectionCard } from "./TripCollectionCard";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type TripLibraryGridProps = {
  trips: MyTripsCardItem[];
};

export function TripLibraryGrid({ trips }: TripLibraryGridProps) {
  return (
    <div className={styles.tripLibrary}>
      {trips.map((trip) => (
        <TripCollectionCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
