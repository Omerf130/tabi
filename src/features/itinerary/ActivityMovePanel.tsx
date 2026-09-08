"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Select } from "@/components/ui/Select/Select";
import {
  updateActivityAction,
  type ActivityActionState,
} from "./actions";
import { toActivityFormValues } from "./to-activity-view-model";
import type { ActivityViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

const initialState: ActivityActionState = {};

type ActivityMovePanelProps = {
  tripId: string;
  activity: ActivityViewModel;
  tripDates: readonly string[];
  onCancel: () => void;
  onSuccess: (result: ActivityActionState) => void;
};

export function ActivityMovePanel({
  tripId,
  activity,
  tripDates,
  onCancel,
  onSuccess,
}: ActivityMovePanelProps) {
  const [state, formAction] = useActionState(updateActivityAction, initialState);
  const [targetDate, setTargetDate] = useState(activity.date);
  const [, startTransition] = useTransition();
  const values = toActivityFormValues(activity);

  useEffect(() => {
    if (state.ok) {
      onSuccess(state);
    }
  }, [state, onSuccess]);

  function handleSubmit() {
    startTransition(() => {
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("activityId", activity.id);
      formData.set("title", values.title);
      formData.set("type", values.type);
      formData.set("date", targetDate);
      formData.set("startTime", values.startTime);
      formData.set("endTime", values.endTime);
      formData.set("locationName", values.locationName);
      formData.set("address", values.address);
      formData.set("notes", values.notes);
      formAction(formData);
    });
  }

  return (
    <div className={styles.movePanel}>
      {state.error ? (
        <p className={styles.inlineError} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.fieldErrors?.date ? (
        <p className={styles.inlineError} role="alert">
          {state.fieldErrors.date}
        </p>
      ) : null}
      <Field label="יום יעד" htmlFor={`move-date-${activity.id}`}>
        <Select
          id={`move-date-${activity.id}`}
          value={targetDate}
          onChange={(event) => setTargetDate(event.target.value)}
        >
          {tripDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </Select>
      </Field>
      <div className={styles.moveActions}>
        <Button type="button" size="compact" onClick={handleSubmit}>
          העברה
        </Button>
        <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </div>
  );
}
