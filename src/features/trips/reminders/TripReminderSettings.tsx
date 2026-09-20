"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { TripReminderCreateFields } from "./TripReminderCreateFields.client";
import { TripReminderBrowserTimeZoneField } from "./TripReminderBrowserTimeZoneField.client";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  completeTripReminderAction,
  createTripReminderAction,
  deleteTripReminderAction,
  updateTripReminderAction,
  type TripReminderActionState,
} from "@/features/trips/reminders/actions";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import {
  translateReminderError,
  translateReminderSuccess,
} from "@/features/trips/reminders/translate-reminder-error";
import {
  getTripSettingsSectionClassName,
  type TripSettingsVariant,
} from "@/features/trips/settings/section-variant";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import styles from "./TripReminderSettings.module.scss";

const initialState: TripReminderActionState = {};

type TripReminderSettingsProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  reminders: TripReminderViewModel[];
  variant?: TripSettingsVariant;
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
  const t = useTranslations("TripReminders");
  const tCommon = useTranslations("Common");
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

  const updateError = translateReminderError(t, updateState.errorCode);
  const completeError = translateReminderError(t, completeState.errorCode);
  const deleteError = translateReminderError(t, deleteState.errorCode);
  const rowError = completeError ?? deleteError;

  if (editing) {
    return (
      <li className={styles.item}>
        <form action={updateAction} className={styles.editForm}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="reminderId" value={reminder.id} />
          <TripReminderBrowserTimeZoneField />
          <div className={styles.formRow}>
            <Field label={tCommon("date")} htmlFor={`edit-date-${reminder.id}`}>
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
            <Field label={tCommon("time")} htmlFor={`edit-time-${reminder.id}`}>
              <Input
                id={`edit-time-${reminder.id}`}
                name="time"
                type="time"
                defaultValue={reminder.time}
                required
              />
            </Field>
          </div>
          <Field label={t("content")} htmlFor={`edit-text-${reminder.id}`}>
            <Textarea
              id={`edit-text-${reminder.id}`}
              name="text"
              defaultValue={reminder.text}
              rows={2}
              required
            />
          </Field>
          {updateError ? (
            <p className={styles.error} role="alert">
              {updateError}
            </p>
          ) : null}
          <div className={styles.rowActions}>
            <AuthSubmitButton>{tCommon("save")}</AuthSubmitButton>
            <Button
              type="button"
              variant="ghost"
              size="compact"
              onClick={() => setEditing(false)}
            >
              {tCommon("cancel")}
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
            {tCommon("edit")}
          </Button>
          <form action={completeAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="reminderId" value={reminder.id} />
            <Button type="submit" variant="ghost" size="compact">
              {t("markComplete")}
            </Button>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="reminderId" value={reminder.id} />
            <Button type="submit" variant="ghost" size="compact">
              {tCommon("delete")}
            </Button>
          </form>
        </div>
      ) : null}
      {rowError ? (
        <p className={styles.error} role="alert">
          {rowError}
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
  variant = "stack",
}: TripReminderSettingsProps) {
  const t = useTranslations("TripReminders");
  const tCommon = useTranslations("Common");
  const [showCreate, setShowCreate] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);
  const [createState, createAction] = useActionState(
    createTripReminderAction,
    initialState,
  );
  const upcoming = reminders.filter((reminder) => !reminder.isCompleted);
  const completed = reminders.filter((reminder) => reminder.isCompleted);

  const createError = translateReminderError(t, createState.errorCode);
  const createSuccess = translateReminderSuccess(t, createState.successCode);

  const openCreate = () => {
    setShowCreate(true);
    requestAnimationFrame(() => {
      createRef.current?.querySelector<HTMLElement>("input, textarea")?.focus();
    });
  };

  return (
    <section
      id="reminders"
      className={getTripSettingsSectionClassName(variant)}
      aria-labelledby="trip-reminders-title"
    >
      <div className={sectionStyles.header}>
        <h2 id="trip-reminders-title" className={sectionStyles.title}>
          {t("settingsTitle")}
        </h2>
        <p className={sectionStyles.hint}>{t("settingsHint")}</p>
      </div>

      {!showCreate ? (
        <Button type="button" variant="ghost" onClick={openCreate}>
          {t("addReminder")}
        </Button>
      ) : (
        <div ref={createRef}>
          <form action={createAction} className={styles.createForm}>
            <p className={styles.createLabel}>{t("newReminderLabel")}</p>
            <TripReminderCreateFields
              tripId={tripId}
              startDate={startDate}
              endDate={endDate}
              idPrefix="settings-reminder"
            />
            {createError ? (
              <p className={styles.error} role="alert">
                {createError}
              </p>
            ) : null}
            {createSuccess ? (
              <p className={styles.success}>{createSuccess}</p>
            ) : null}
            <div className={styles.rowActions}>
              <AuthSubmitButton>{t("addSubmit")}</AuthSubmitButton>
              <Button
                type="button"
                variant="ghost"
                size="compact"
                onClick={() => setShowCreate(false)}
              >
                {tCommon("cancel")}
              </Button>
            </div>
          </form>
        </div>
      )}

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
        <p className={styles.empty}>{t("emptyUpcoming")}</p>
      )}

      {completed.length > 0 ? (
        <div className={styles.completedBlock}>
          <h3 className={styles.completedTitle}>{t("completedSection")}</h3>
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
