"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteActivityAction,
  reorderActivityAction,
} from "./actions";
import { ACTIVITY_MESSAGES } from "./constants";
import styles from "./ItineraryPage.module.scss";

type ActivityRowActionsProps = {
  tripId: string;
  activityId: string;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onMove: () => void;
  onMutation: () => void;
};

export function ActivityRowActions({
  tripId,
  activityId,
  isOpen,
  onToggle,
  onEdit,
  onMove,
  onMutation,
}: ActivityRowActionsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function submitReorder(direction: "up" | "down") {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("activityId", activityId);
      formData.set("direction", direction);
      const result = await reorderActivityAction({}, formData);
      if (result.ok) {
        setError(undefined);
        onMutation();
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm(ACTIVITY_MESSAGES.deleteConfirm)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("activityId", activityId);
      const result = await deleteActivityAction({}, formData);
      if (result.ok) {
        setError(undefined);
        onMutation();
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  return (
    <div className={styles.activityActions}>
      <div className={styles.activityActionRow}>
        <button type="button" className={styles.actionLink} onClick={onEdit}>
          עריכה
        </button>
        <button
          type="button"
          className={styles.actionLink}
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          פעולות
        </button>
      </div>
      {isOpen ? (
        <div className={styles.secondaryActions}>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => submitReorder("up")}
          >
            הזזה למעלה
          </button>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => submitReorder("down")}
          >
            הזזה למטה
          </button>
          <button type="button" className={styles.secondaryAction} onClick={onMove}>
            העברה ליום אחר
          </button>
          <button
            type="button"
            className={styles.secondaryActionDanger}
            onClick={handleDelete}
          >
            מחיקה
          </button>
          {error ? (
            <p className={styles.inlineError} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
