"use client";

import {
  useEffect,
  useState,
} from "react";
import { IconBell, IconChevron } from "@/components/ui/icons";
import {
  getNextReminderIndex,
  REMINDER_ROTATION_MS,
  shouldAutoRotateReminders,
} from "./home-reminder-rotation";
import { useTripHomeReminders } from "./TripHomeRemindersContext.client";
import type { TripHomeImportantToday } from "./types";
import styles from "./TripHomeContent.module.scss";

type ImportantTodaySectionProps = TripHomeImportantToday;

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

export function ImportantTodaySection({ reminders }: ImportantTodaySectionProps) {
  const { openManager } = useTripHomeReminders();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    if (!shouldAutoRotateReminders(reminders.length, prefersReducedMotion)) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleIndex((current) => getNextReminderIndex(current, reminders.length));
    }, REMINDER_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, reminders.length]);

  const currentReminder = reminders[visibleIndex] ?? reminders[0]!;

  return (
    <div className={styles.duringImportantToday}>
      <button
        type="button"
        className={styles.duringImportantTodayTrigger}
        onClick={() => openManager({ tab: "today" })}
        aria-label={`חשוב להיום: ${currentReminder.text}`}
      >
        <span className={styles.duringBlockHeader}>
          <span className={styles.duringBlockHeaderStart}>
            <IconBell className={styles.duringBlockIcon} aria-hidden />
            <span className={styles.duringBlockTitle}>חשוב להיום</span>
          </span>
          <IconChevron className={styles.duringBlockChevron} aria-hidden />
        </span>

        <span className={styles.duringImportantTodayBody}>
          <span className={styles.duringImportantTodayDot} aria-hidden />
          <span className={styles.duringImportantTodayCopy}>
            <span
              key={currentReminder.id}
              className={
                prefersReducedMotion
                  ? styles.duringImportantTodayText
                  : styles.duringImportantTodayTextAnimated
              }
              dir="auto"
            >
              {currentReminder.text}
            </span>
            <span className={styles.duringImportantTodayTime}>
              {currentReminder.time}
            </span>
          </span>
          {reminders.length > 1 ? (
            <span className={styles.duringImportantTodayCount}>
              +{reminders.length - 1}
            </span>
          ) : null}
        </span>
      </button>

      <button
        type="button"
        className={styles.duringImportantTodayManageLink}
        onClick={() => openManager({ tab: "today" })}
      >
        לכל התזכורות
      </button>
    </div>
  );
}
