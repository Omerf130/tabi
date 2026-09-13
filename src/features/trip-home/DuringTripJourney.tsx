import { ActivityCompactCard } from "./ActivityCompactCard";
import { DuringTodaySummary } from "./DuringTodaySummary";
import { ImportantTodaySection } from "./ImportantTodaySection";
import { TodaysPlanSection } from "./TodaysPlanSection";
import { TripHomeRemindersEntry } from "./TripHomeRemindersEntry.client";
import type { TripHomeActiveViewModel } from "./types";
import styles from "./TripHomeContent.module.scss";

export const DURING_SURFACE_SECTION_ORDER = [
  "importantToday",
  "now",
  "upNext",
  "todaySummary",
  "todaysPlan",
] as const;

type DuringTripJourneyProps = {
  model: TripHomeActiveViewModel;
};

export function DuringTripJourney({ model }: DuringTripJourneyProps) {
  return (
    <section className={styles.duringJourney} aria-label="היום בטיול">
      {model.importantToday ? (
        <ImportantTodaySection {...model.importantToday} />
      ) : (
        <TripHomeRemindersEntry defaultTab="today" />
      )}

      {model.now ? (
        <section className={styles.homeSection} aria-label="עכשיו">
          <ActivityCompactCard
            card={model.now}
            tone="now"
            eyebrow="עכשיו"
            headingId="trip-home-now"
          />
        </section>
      ) : null}

      {model.upNext ? (
        <section className={styles.homeSection} aria-label="הבא בתור">
          <ActivityCompactCard
            card={model.upNext}
            tone="up-next"
            eyebrow="הבא בתור"
            headingId="trip-home-up-next"
          />
        </section>
      ) : null}

      <DuringTodaySummary summary={model.todaySummary} />

      <TodaysPlanSection section={model.todaysPlan} />
    </section>
  );
}
