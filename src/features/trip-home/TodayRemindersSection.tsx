"use client";

import { useTranslations } from "next-intl";
import { useTripHomeReminders } from "./TripHomeRemindersContext.client";
import type { TripHomeImportantToday } from "./types";
import styles from "./TripHomeContent.module.scss";

type TodayRemindersSectionProps = TripHomeImportantToday;

export function TodayRemindersSection({ reminders }: TodayRemindersSectionProps) {
  const t = useTranslations("Home");
  const { openManager } = useTripHomeReminders();

  return (
    <section className={styles.todayReminders} aria-labelledby="trip-home-reminders">
      <div className={styles.todayRemindersHeader}>
        <h2 id="trip-home-reminders" className={styles.todayRemindersTitle}>
          {t("todayRemindersTitle")}
        </h2>
        <button
          type="button"
          className={styles.todayRemindersAllLink}
          onClick={() => openManager({ tab: "today" })}
        >
          {t("remindersAll")}
        </button>
      </div>
      <ul className={styles.todayRemindersList}>
        {reminders.map((reminder) => (
          <li key={reminder.id}>
            <button
              type="button"
              className={styles.todayReminderRow}
              onClick={() => openManager({ tab: "today" })}
              aria-label={t("importantTodayAria", { text: reminder.text })}
            >
              <span className={styles.todayReminderStatus} aria-hidden />
              <span className={styles.todayReminderCopy}>
                <span className={styles.todayReminderText} dir="auto">
                  {reminder.text}
                </span>
                <span className={styles.todayReminderTime}>{reminder.time}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
