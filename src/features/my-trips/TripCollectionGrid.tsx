import type { TripPhase } from "@/features/trips/trip-phase";
import { MY_TRIPS_PHASE_LABELS } from "./constants";
import { TripCollectionCard } from "./TripCollectionCard";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

const PHASE_SECTION_ORDER: TripPhase[] = ["active", "upcoming", "completed"];

type TripCollectionGridProps = {
  trips: MyTripsCardItem[];
};

export function TripCollectionGrid({ trips }: TripCollectionGridProps) {
  const sections = PHASE_SECTION_ORDER.map((phase) => ({
    phase,
    label: MY_TRIPS_PHASE_LABELS[phase],
    trips: trips.filter((trip) => trip.phase === phase),
  })).filter((section) => section.trips.length > 0);

  return (
    <div className={styles.collection}>
      {sections.map((section) => (
        <section
          key={section.phase}
          className={styles.collectionSection}
          aria-labelledby={`my-trips-section-${section.phase}`}
        >
          <h2
            id={`my-trips-section-${section.phase}`}
            className={styles.collectionSectionTitle}
          >
            {section.label}
          </h2>
          <div className={styles.collectionGrid}>
            {section.trips.map((trip) => (
              <TripCollectionCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
