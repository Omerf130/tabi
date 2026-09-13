"use client";

import { useTranslations } from "next-intl";
import type { ReminderManagerTab } from "@/features/trips/reminders/filter-trip-home-reminders";
import { useTripHomeReminders } from "./TripHomeRemindersContext.client";
import styles from "./TripHomeContent.module.scss";

type TripHomeRemindersEntryProps = {
  defaultTab?: ReminderManagerTab;
};

export function TripHomeRemindersEntry({
  defaultTab = "today",
}: TripHomeRemindersEntryProps) {
  const t = useTranslations("Home");
  const { openManager } = useTripHomeReminders();

  return (
    <section className={styles.homeSection} aria-label={t("remindersTitle")}>
      <div className={styles.homeSectionHeader}>
        <h2 className={styles.homeSectionTitle}>{t("remindersTitle")}</h2>
        <button
          type="button"
          className={styles.homeSectionAction}
          onClick={() => openManager({ tab: defaultTab })}
        >
          {t("remindersAll")}
        </button>
      </div>
    </section>
  );
}
