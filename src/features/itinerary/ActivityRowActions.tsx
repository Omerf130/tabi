"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteActivityAction,
  reorderActivityAction,
} from "./actions";
import { ACTIVITY_ERROR_CODES } from "./constants";
import { translateActivityError } from "./translate-activity-error";
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
  const t = useTranslations("Activity");
  const tItinerary = useTranslations("Itinerary");
  const tCommon = useTranslations("Common");
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
      setError(translateActivityError(t, result.error));
    });
  }

  function handleDelete() {
    if (!window.confirm(t(`errors.${ACTIVITY_ERROR_CODES.deleteConfirm}`))) {
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
      setError(translateActivityError(t, result.error));
    });
  }

  return (
    <div className={styles.activityActions}>
      <div className={styles.activityActionRow}>
        <button type="button" className={styles.actionLink} onClick={onEdit}>
          {tCommon("edit")}
        </button>
        <button
          type="button"
          className={styles.actionLink}
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          {tItinerary("activityActions")}
        </button>
      </div>
      {isOpen ? (
        <div className={styles.secondaryActions}>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => submitReorder("up")}
          >
            {tItinerary("moveUp")}
          </button>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => submitReorder("down")}
          >
            {tItinerary("moveDown")}
          </button>
          <button type="button" className={styles.secondaryAction} onClick={onMove}>
            {tItinerary("moveToDay")}
          </button>
          <button
            type="button"
            className={styles.secondaryActionDanger}
            onClick={handleDelete}
          >
            {tCommon("delete")}
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
