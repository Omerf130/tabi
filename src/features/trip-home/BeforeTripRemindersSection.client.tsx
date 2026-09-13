"use client";

import type { UpcomingHomeReminderItem } from "@/features/trips/reminders/select-upcoming-home-reminders";
import { useTripHomeReminders } from "./TripHomeRemindersContext.client";
import styles from "./TripHomeContent.module.scss";

type BeforeTripRemindersSectionProps = {
  reminders: readonly UpcomingHomeReminderItem[];
};

export function BeforeTripRemindersSection({
  reminders,
}: BeforeTripRemindersSectionProps) {
  const { openManager } = useTripHomeReminders();

  return (
    <section className={styles.homeSection} aria-label="תזכורות קרובות">
      <div className={styles.homeSectionHeader}>
        <h2 className={styles.homeSectionTitle}>תזכורות קרובות</h2>
        <button
          type="button"
          className={styles.homeSectionAction}
          onClick={() => openManager({ tab: "upcoming" })}
        >
          לכל התזכורות
        </button>
      </div>
      {reminders.length === 0 ? (
        <p className={styles.homeEmptyState}>אין תזכורות קרובות</p>
      ) : (
        <ul className={styles.homeRowList}>
          {reminders.map((reminder) => (
            <li key={reminder.id} className={styles.homeRowItem}>
              <span className={styles.homeRowIndicator} aria-hidden />
              <div className={styles.homeRowCopy}>
                <p className={styles.homeRowPrimary} dir="auto">
                  {reminder.text}
                </p>
                <p className={styles.homeRowMeta}>
                  {reminder.dateLabel}
                  <span className={styles.heroDot}>·</span>
                  {reminder.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
