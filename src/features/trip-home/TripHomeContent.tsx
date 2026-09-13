import { AfterTripJourney } from "./AfterTripJourney";
import { BeforeTripJourney } from "./BeforeTripJourney";
import { DuringTripJourney } from "./DuringTripJourney";
import { TripHomeCountdown } from "./TripHomeCountdown.client";
import { TripHomeHero } from "./TripHomeHero";
import { TripHomeRemindersHost } from "./TripHomeRemindersHost.client";
import type { TripHomeViewModel } from "./types";
import styles from "./TripHomeContent.module.scss";

type TripHomeContentProps = {
  model: TripHomeViewModel;
};

function TripHomePhaseContent({ model }: TripHomeContentProps) {
  return (
    <div className={styles.home} data-phase={model.phase}>
      <TripHomeHero hero={model.hero} phase={model.phase} />

      {model.phase === "upcoming" ? (
        <>
          <TripHomeCountdown
            targetMs={model.countdown.targetMs}
            referenceMs={model.countdown.referenceMs}
          />
          <BeforeTripJourney journey={model.beforeJourney} />
        </>
      ) : null}

      {model.phase === "active" ? <DuringTripJourney model={model} /> : null}

      {model.phase === "completed" ? (
        <AfterTripJourney
          tripSummary={model.tripSummary}
          memories={model.memories}
          financeRecap={model.financeRecap}
          itineraryRevisit={model.itineraryRevisit}
        />
      ) : null}
    </div>
  );
}

export function TripHomeContent({ model }: TripHomeContentProps) {
  if (model.phase === "upcoming" || model.phase === "active") {
    return (
      <TripHomeRemindersHost managerData={model.remindersManager}>
        <TripHomePhaseContent model={model} />
      </TripHomeRemindersHost>
    );
  }

  return <TripHomePhaseContent model={model} />;
}
