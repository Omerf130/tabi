"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Select } from "@/components/ui/Select/Select";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS,
  type ActivityType,
} from "./activity-types";
import {
  createActivityAction,
  updateActivityAction,
  type ActivityActionState,
} from "./actions";
import { ActivityLocationSection } from "./ActivityLocationSection";
import type { ActivityFormValues } from "./types";
import styles from "./ActivityForm.module.scss";

const initialState: ActivityActionState = {};

type ActivityFormProps = {
  tripId: string;
  tripDates: readonly string[];
  defaultValues: ActivityFormValues;
  mode: "create" | "edit";
  activityId?: string;
  lockDate?: boolean;
  onCancel?: () => void;
  onSuccess?: (result: ActivityActionState) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export function ActivityForm({
  tripId,
  tripDates,
  defaultValues,
  mode,
  activityId,
  lockDate = false,
  onCancel,
  onSuccess,
  onDirtyChange,
}: ActivityFormProps) {
  const action = mode === "create" ? createActivityAction : updateActivityAction;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok && onSuccess) {
      onSuccess(state);
    }
  }, [state, onSuccess]);

  function handleChange() {
    onDirtyChange?.(true);
  }

  return (
    <form
      action={formAction}
      className={styles.form}
      onChange={handleChange}
      onInput={handleChange}
    >
      <input type="hidden" name="tripId" value={tripId} />
      {lockDate ? (
        <input type="hidden" name="date" value={defaultValues.date} />
      ) : null}
      {mode === "edit" && activityId ? (
        <input type="hidden" name="activityId" value={activityId} />
      ) : null}

      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}

      <Field label="כותרת" htmlFor="title" error={state.fieldErrors?.title}>
        <Input
          id="title"
          name="title"
          defaultValue={defaultValues.title}
          required
          maxLength={120}
          aria-invalid={state.fieldErrors?.title ? true : undefined}
        />
      </Field>

      <Field label="סוג" htmlFor="type" error={state.fieldErrors?.type}>
        <Select
          id="type"
          name="type"
          defaultValue={defaultValues.type}
          required
          aria-invalid={state.fieldErrors?.type ? true : undefined}
        >
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {ACTIVITY_TYPE_LABELS[type as ActivityType]}
            </option>
          ))}
        </Select>
      </Field>

      {!lockDate ? (
        <Field label="יום" htmlFor="date" error={state.fieldErrors?.date}>
          <Select
            id="date-visible"
            name="date"
            defaultValue={defaultValues.date}
            required
            aria-invalid={state.fieldErrors?.date ? true : undefined}
          >
            {tripDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className={styles.timeRow}>
        <Field
          label="שעת התחלה"
          htmlFor="startTime"
          error={state.fieldErrors?.startTime}
        >
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={defaultValues.startTime}
            aria-invalid={state.fieldErrors?.startTime ? true : undefined}
          />
        </Field>
        <Field
          label="שעת סיום"
          htmlFor="endTime"
          error={state.fieldErrors?.endTime}
        >
          <Input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={defaultValues.endTime}
            aria-invalid={state.fieldErrors?.endTime ? true : undefined}
          />
        </Field>
      </div>

      <div className={styles.locationBlock}>
        <p className={styles.locationHeading}>מיקום</p>
        <ActivityLocationSection
          tripId={tripId}
          defaultValues={defaultValues}
          fieldErrors={state.fieldErrors}
          onDirtyChange={handleChange}
        />
      </div>

      <Field label="הערות" htmlFor="notes" error={state.fieldErrors?.notes}>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues.notes}
          maxLength={2000}
          rows={3}
          dir="auto"
          aria-invalid={state.fieldErrors?.notes ? true : undefined}
        />
      </Field>

      <div className={styles.actions}>
        <AuthSubmitButton>
          {mode === "create" ? "הוספת פעילות" : "שמירה"}
        </AuthSubmitButton>
        {onCancel ? (
          <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
            ביטול
          </Button>
        ) : null}
      </div>
    </form>
  );
}
