import { getTranslations } from "next-intl/server";
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

export async function DuringTripJourney({ model }: DuringTripJourneyProps) {
  const t = await getTranslations("Home");

  return (
    <section className={styles.duringJourney} aria-label={t("duringJourneyAria")}>
      {model.importantToday ? (
        <ImportantTodaySection {...model.importantToday} />
      ) : (
        <TripHomeRemindersEntry defaultTab="today" />
      )}

      {model.now ? (
        <section className={styles.homeSection} aria-label={t("nowSectionAria")}>
          <ActivityCompactCard
            card={model.now}
            tone="now"
            eyebrow={t("nowEyebrow")}
            headingId="trip-home-now"
          />
        </section>
      ) : null}

      {model.upNext ? (
        <section className={styles.homeSection} aria-label={t("upNextSectionAria")}>
          <ActivityCompactCard
            card={model.upNext}
            tone="up-next"
            eyebrow={t("upNextEyebrow")}
            headingId="trip-home-up-next"
          />
        </section>
      ) : null}

      <DuringTodaySummary summary={model.todaySummary} />

      <TodaysPlanSection section={model.todaysPlan} />
    </section>
  );
}
