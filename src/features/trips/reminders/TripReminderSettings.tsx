"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  completeTripReminderAction,
  createTripReminderAction,
  deleteTripReminderAction,
  updateTripReminderAction,
  type TripReminderActionState,
} from "@/features/trips/reminders/actions";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import styles from "./TripReminderSettings.module.scss";

const initialState: TripReminderActionState = {};

type TripReminderSettingsProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  reminders: TripReminderViewModel[];
};

type ReminderRowProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  reminder: TripReminderViewModel;
};

function ReminderRow({
  tripId,
  startDate,
  endDate,
  reminder,
}: ReminderRowProps) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction] = useActionState(
    updateTripReminderAction,
    initialState,
  );
  const [completeState, completeAction] = useActionState(
    completeTripReminderAction,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteTripReminderAction,
    initialState,
  );

  if (editing) {
    return (
      <li className={styles.item}>
        <form action={updateAction} className={styles.editForm}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="reminderId" value={reminder.id} />
          <div className={styles.formRow}>
            <Field label="תאריך" htmlFor={`edit-date-${reminder.id}`}>
              <Input
                id={`edit-date-${reminder.id}`}
                name="date"
                type="date"
                defaultValue={reminder.date}
                min={startDate}
                max={endDate}
                required
              />
            </Field>
            <Field label="שעה" htmlFor={`edit-time-${reminder.id}`}>
              <Input
                id={`edit-time-${reminder.id}`}
                name="time"
                type="time"
                defaultValue={reminder.time}
                required
              />
            </Field>
          </div>
          <Field label="תוכן התזכורת" htmlFor={`edit-text-${reminder.id}`}>
            <Textarea
              id={`edit-text-${reminder.id}`}
              name="text"
              defaultValue={reminder.text}
              rows={2}
              required
            />
          </Field>
          {updateState.error ? (
            <p className={styles.error} role="alert">
              {updateState.error}
            </p>
          ) : null}
          <div className={styles.rowActions}>
            <AuthSubmitButton>שמירה</AuthSubmitButton>
            <Button
              type="button"
              variant="ghost"
              size="compact"
              onClick={() => setEditing(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={styles.item}
      data-completed={reminder.isCompleted ? "true" : undefined}
    >
      <div className={styles.itemBody}>
        <p className={styles.itemMeta}>{reminder.displayLine}</p>
        <p className={styles.itemText} dir="auto">
          {reminder.text}
        </p>
      </div>
      {!reminder.isCompleted ? (
        <div className={styles.rowActions}>
          <Button
            type="button"
            variant="ghost"
            size="compact"
            onClick={() => setEditing(true)}
          >
            עריכה
          </Button>
          <form action={completeAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="reminderId" value={reminder.id} />
            <Button type="submit" variant="ghost" size="compact">
              הושלם
            </Button>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="reminderId" value={reminder.id} />
            <Button type="submit" variant="ghost" size="compact">
              מחיקה
            </Button>
          </form>
        </div>
      ) : null}
      {completeState.error || deleteState.error ? (
        <p className={styles.error} role="alert">
          {completeState.error ?? deleteState.error}
        </p>
      ) : null}
    </li>
  );
}

export function TripReminderSettings({
  tripId,
  startDate,
  endDate,
  reminders,
}: TripReminderSettingsProps) {
  const [createState, createAction] = useActionState(
    createTripReminderAction,
    initialState,
  );
  const upcoming = reminders.filter((reminder) => !reminder.isCompleted);
  const completed = reminders.filter((reminder) => reminder.isCompleted);

  return (
    <section
      id="reminders"
      className={sectionStyles.section}
      aria-labelledby="trip-reminders-title"
    >
      <div className={sectionStyles.header}>
        <h2 id="trip-reminders-title" className={sectionStyles.title}>
          תזכורות אישיות
        </h2>
        <p className={sectionStyles.hint}>
          תזכורות פרטיות שלכם בלבד. חברי הטיול לא רואים אותן.
        </p>
      </div>

      <form action={createAction} className={styles.createForm}>
        <input type="hidden" name="tripId" value={tripId} />
        <p className={styles.createLabel}>+ תזכורת חדשה</p>
        <div className={styles.formRow}>
          <Field label="תאריך" htmlFor="reminder-date">
            <Input
              id="reminder-date"
              name="date"
              type="date"
              min={startDate}
              max={endDate}
              required
            />
          </Field>
          <Field label="שעה" htmlFor="reminder-time">
            <Input id="reminder-time" name="time" type="time" required />
          </Field>
        </div>
        <Field label="תוכן התזכורת" htmlFor="reminder-text">
          <Textarea id="reminder-text" name="text" rows={2} required />
        </Field>
        {createState.error ? (
          <p className={styles.error} role="alert">
            {createState.error}
          </p>
        ) : null}
        {createState.success ? (
          <p className={styles.success}>{createState.success}</p>
        ) : null}
        <AuthSubmitButton>הוספה</AuthSubmitButton>
      </form>

      {upcoming.length > 0 ? (
        <ul className={styles.list}>
          {upcoming.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              tripId={tripId}
              startDate={startDate}
              endDate={endDate}
              reminder={reminder}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>אין תזכורות קרובות.</p>
      )}

      {completed.length > 0 ? (
        <div className={styles.completedBlock}>
          <h3 className={styles.completedTitle}>הושלמו</h3>
          <ul className={styles.list}>
            {completed.map((reminder) => (
              <ReminderRow
                key={reminder.id}
                tripId={tripId}
                startDate={startDate}
                endDate={endDate}
                reminder={reminder}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
