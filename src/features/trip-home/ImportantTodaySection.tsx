"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { IconBell, IconChevron } from "@/components/ui/icons";
import {
  canOpenReminderPanel,
  getNextReminderIndex,
  REMINDER_ROTATION_MS,
  shouldAutoRotateReminders,
} from "./home-reminder-rotation";
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

type ReminderPanelProps = {
  reminders: TripHomeImportantToday["reminders"];
  settingsHref: string;
  titleId: string;
  onClose: () => void;
};

function ReminderPanel({
  reminders,
  settingsHref,
  titleId,
  onClose,
}: ReminderPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.reminderPanel}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className={styles.reminderPanelInner}>
        <div className={styles.reminderPanelHeader}>
          <h3 id={titleId} className={styles.reminderPanelTitle}>
            חשוב להיום
          </h3>
          <button
            type="button"
            className={styles.reminderPanelClose}
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>
        <ul className={styles.reminderPanelList}>
          {reminders.map((reminder) => (
            <li key={reminder.id} className={styles.reminderPanelItem}>
              <p className={styles.reminderMeta}>{reminder.time}</p>
              <p className={styles.reminderText} dir="auto">
                {reminder.text}
              </p>
            </li>
          ))}
        </ul>
        <Link href={settingsHref} className={styles.sectionLink}>
          לניהול התזכורות
        </Link>
      </div>
    </dialog>
  );
}

export function ImportantTodaySection({
  reminders,
  settingsHref,
}: ImportantTodaySectionProps) {
  const titleId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!shouldAutoRotateReminders(reminders.length, prefersReducedMotion)) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleIndex((current) => getNextReminderIndex(current, reminders.length));
    }, REMINDER_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, reminders.length]);

  const openPanel = useCallback(() => {
    if (canOpenReminderPanel(reminders.length)) {
      setPanelOpen(true);
    }
  }, [reminders.length]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const currentReminder = reminders[visibleIndex] ?? reminders[0]!;

  return (
    <div className={styles.duringImportantToday}>
      <button
        type="button"
        className={styles.duringImportantTodayTrigger}
        onClick={openPanel}
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

      {panelOpen ? (
        <ReminderPanel
          reminders={reminders}
          settingsHref={settingsHref}
          titleId={titleId}
          onClose={closePanel}
        />
      ) : null}
    </div>
  );
}
