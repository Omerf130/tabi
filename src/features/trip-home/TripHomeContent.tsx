import { AfterTripJourney } from "./AfterTripJourney";

import { BeforeTripJourney } from "./BeforeTripJourney";

import { DuringTripJourney } from "./DuringTripJourney";

import { TripHomeHero } from "./TripHomeHero";

import type { TripHomeViewModel } from "./types";

import styles from "./TripHomeContent.module.scss";



type TripHomeContentProps = {

  model: TripHomeViewModel;

};



export function TripHomeContent({ model }: TripHomeContentProps) {

  return (

    <div className={styles.home} data-phase={model.phase}>

      <TripHomeHero hero={model.hero} phase={model.phase} />



      {model.phase === "upcoming" ? (

        <BeforeTripJourney journey={model.beforeJourney} />

      ) : null}



      {model.phase === "active" ? <DuringTripJourney model={model} /> : null}



      {model.phase === "completed" ? (

        <AfterTripJourney

          memories={model.memories}

          itineraryRevisit={model.itineraryRevisit}

        />

      ) : null}

    </div>

  );

}


