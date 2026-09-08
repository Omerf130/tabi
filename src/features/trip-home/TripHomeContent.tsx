import type { TripHomeViewModel } from "./types";
import { HomeReminderStrip } from "./HomeReminderStrip.client";
import {
  ActiveHomeHero,
  CompletedHomeHero,
  CompletedItineraryEntry,
  DailyItinerarySummarySection,
  UpcomingHomeHero,
} from "./TripHomeSections";
import styles from "./TripHomeContent.module.scss";

type TripHomeContentProps = {
  model: TripHomeViewModel;
};

export function TripHomeContent({ model }: TripHomeContentProps) {
  return (
    <div className={styles.home} data-phase={model.phase}>
      {model.phase === "upcoming" ? <UpcomingHomeHero model={model} /> : null}
      {model.phase === "active" ? <ActiveHomeHero model={model} /> : null}
      {model.phase === "completed" ? <CompletedHomeHero model={model} /> : null}

      <HomeReminderStrip
        key={model.reminderStrip.reminders.map((reminder) => reminder.id).join("-")}
        {...model.reminderStrip}
      />

      {model.dailyItinerary ? (
        <DailyItinerarySummarySection summary={model.dailyItinerary} />
      ) : null}

      {model.phase === "completed" ? (
        <CompletedItineraryEntry model={model} />
      ) : null}
    </div>
  );
}
