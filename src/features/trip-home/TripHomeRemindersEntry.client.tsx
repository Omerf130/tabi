"use client";

import type { ReminderManagerTab } from "@/features/trips/reminders/filter-trip-home-reminders";
import { useTripHomeReminders } from "./TripHomeRemindersContext.client";
import styles from "./TripHomeContent.module.scss";

type TripHomeRemindersEntryProps = {
  defaultTab?: ReminderManagerTab;
};

export function TripHomeRemindersEntry({
  defaultTab = "today",
}: TripHomeRemindersEntryProps) {
  const { openManager } = useTripHomeReminders();

  return (
    <section className={styles.homeSection} aria-label="תזכורות">
      <div className={styles.homeSectionHeader}>
        <h2 className={styles.homeSectionTitle}>תזכורות</h2>
        <button
          type="button"
          className={styles.homeSectionAction}
          onClick={() => openManager({ tab: defaultTab })}
        >
          לכל התזכורות
        </button>
      </div>
    </section>
  );
}
