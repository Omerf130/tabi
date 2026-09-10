import { ImportantTodaySection } from "./ImportantTodaySection";
import { NowCard } from "./NowCard";
import { TodaysPlanSection } from "./TodaysPlanSection";
import { TonightCard } from "./TonightCard";
import { UpNextCard } from "./UpNextCard";
import type { TripHomeActiveViewModel } from "./types";
import styles from "./TripHomeContent.module.scss";

export const DURING_SURFACE_SECTION_ORDER = [
  "importantToday",
  "todaysPlan",
  "now",
  "upNext",
  "tonight",
] as const;

type DuringTripJourneyProps = {
  model: TripHomeActiveViewModel;
};

export function DuringTripJourney({ model }: DuringTripJourneyProps) {
  return (
    <section className={styles.duringJourney} aria-label="היום בטיול">
      <div className={styles.duringJourneyInner}>
        <div className={styles.duringJourneyPrimary}>
          {model.importantToday ? (
            <ImportantTodaySection {...model.importantToday} />
          ) : null}
          <TodaysPlanSection section={model.todaysPlan} />
        </div>

        <div className={styles.duringJourneySecondary}>
          {model.now ? <NowCard card={model.now} /> : null}
          {model.upNext ? <UpNextCard card={model.upNext} /> : null}
          {model.tonight ? <TonightCard card={model.tonight} /> : null}
        </div>
      </div>
    </section>
  );
}
