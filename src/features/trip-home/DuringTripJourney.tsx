import { getTranslations } from "next-intl/server";
import { ActivityCompactCard } from "./ActivityCompactCard";
import { DuringFullDayLink } from "./DuringFullDayLink";
import { DuringTodaySummary } from "./DuringTodaySummary";
import { LaterTodaySection } from "./LaterTodaySection";
import { TodayRemindersSection } from "./TodayRemindersSection";
import type { TripHomeActiveViewModel } from "./types";
import styles from "./TripHomeContent.module.scss";

export const DURING_SURFACE_SECTION_ORDER = [
  "importantToday",
  "now",
  "upNext",
  "laterToday",
  "todaySummary",
  "fullDayItinerary",
] as const;

type DuringTripJourneyProps = {
  model: TripHomeActiveViewModel;
};

export async function DuringTripJourney({ model }: DuringTripJourneyProps) {
  const t = await getTranslations("Home");

  return (
    <section className={styles.duringJourney} aria-label={t("duringJourneyAria")}>
      {model.importantToday ? (
        <TodayRemindersSection {...model.importantToday} />
      ) : null}

      {model.now ? (
        <section
          className={styles.duringNowNextSection}
          aria-label={t("nowSectionAria")}
        >
          <ActivityCompactCard
            card={model.now}
            tone="now"
            eyebrow={t("nowEyebrow")}
            headingId="trip-home-now"
          />
        </section>
      ) : null}

      {model.upNext ? (
        <section
          className={styles.duringNowNextSection}
          aria-label={t("upNextSectionAria")}
        >
          <ActivityCompactCard
            card={model.upNext}
            tone="up-next"
            eyebrow={t("upNextEyebrow")}
            headingId="trip-home-up-next"
          />
        </section>
      ) : null}

      <LaterTodaySection items={model.laterToday} />

      <DuringTodaySummary summary={model.todaySummary} />

      <DuringFullDayLink link={model.fullDayItinerary} />
    </section>
  );
}
