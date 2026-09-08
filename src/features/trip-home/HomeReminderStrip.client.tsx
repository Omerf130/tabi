"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  canOpenReminderPanel,
  getNextReminderIndex,
  REMINDER_ROTATION_MS,
  shouldAutoRotateReminders,
} from "./home-reminder-rotation";
import type { TripHomeReminderItem, TripHomeReminderStrip } from "./types";
import styles from "./HomeReminderStrip.module.scss";

type HomeReminderStripProps = TripHomeReminderStrip;

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
  reminders: TripHomeReminderItem[];
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
      className={styles.panel}
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
      <div className={styles.panelInner}>
        <div className={styles.panelHeader}>
          <h2 id={titleId} className={styles.panelTitle}>
            התזכורות שלי להיום
          </h2>
          <button
            type="button"
            className={styles.panelClose}
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>
        <ul className={styles.panelList}>
          {reminders.map((reminder) => (
            <li key={reminder.id} className={styles.panelItem}>
              <p className={styles.panelItemTime}>{reminder.time}</p>
              <p className={styles.panelItemText} dir="auto">
                {reminder.text}
              </p>
            </li>
          ))}
        </ul>
        <Link href={settingsHref} className={styles.panelManageLink}>
          לניהול התזכורות
        </Link>
      </div>
    </dialog>
  );
}

export function HomeReminderStrip({
  reminders,
  settingsHref,
  emptyMessage,
}: HomeReminderStripProps) {
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
  }, [prefersReducedMotion, reminders]);

  const openPanel = useCallback(() => {
    if (canOpenReminderPanel(reminders.length)) {
      setPanelOpen(true);
    }
  }, [reminders.length]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  if (reminders.length === 0) {
    return (
      <div className={styles.strip} data-empty="true">
        <span className={styles.icon} aria-hidden>
          🔔
        </span>
        <span className={styles.emptyMessage}>{emptyMessage}</span>
      </div>
    );
  }

  const currentReminder = reminders[visibleIndex] ?? reminders[0]!;

  return (
    <>
      <button
        type="button"
        className={styles.strip}
        onClick={openPanel}
        aria-label={`תזכורות להיום: ${currentReminder.text}`}
      >
        <span className={styles.icon} aria-hidden>
          🔔
        </span>
        <span className={styles.content}>
          <span
            key={currentReminder.id}
            className={
              prefersReducedMotion ? styles.reminderBlock : styles.reminderBlockAnimated
            }
          >
            <span className={styles.time}>{currentReminder.time}</span>
            <span className={styles.text} dir="auto">
              {currentReminder.text}
            </span>
          </span>
        </span>
        <span className={styles.chevron} aria-hidden>
          ‹
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
    </>
  );
}
