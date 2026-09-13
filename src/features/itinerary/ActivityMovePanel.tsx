"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Select } from "@/components/ui/Select/Select";
import {
  updateActivityAction,
  type ActivityActionState,
} from "./actions";
import { appendActivityFormValuesToFormData } from "./append-activity-form-values";
import { toActivityFormValues } from "./to-activity-view-model";
import { translateActivityError } from "./translate-activity-error";
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
  const t = useTranslations("Activity");
  const tCommon = useTranslations("Common");
  const [state, formAction] = useActionState(updateActivityAction, initialState);
  const [targetDate, setTargetDate] = useState(activity.date);
  const [, startTransition] = useTransition();
  const values = toActivityFormValues(activity);
  const errorMessage = translateActivityError(t, state.error);
  const dateError = state.fieldErrors?.date
    ? translateActivityError(t, state.fieldErrors.date)
    : undefined;

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
      appendActivityFormValuesToFormData(formData, values);
      formData.set("notes", values.notes);
      formAction(formData);
    });
  }

  return (
    <div className={styles.movePanel}>
      {errorMessage ? (
        <p className={styles.inlineError} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {dateError ? (
        <p className={styles.inlineError} role="alert">
          {dateError}
        </p>
      ) : null}
      <Field label={tCommon("targetDay")} htmlFor={`move-date-${activity.id}`}>
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
          {tCommon("move")}
        </Button>
        <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
      </div>
    </div>
  );
}
