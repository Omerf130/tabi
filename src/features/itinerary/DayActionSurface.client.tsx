"use client";

import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconActivityAttraction,
  IconActivityTransport,
  IconCalendar,
  IconDocuments,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { TripDocumentForm } from "@/features/documents/TripDocumentSettings";
import { createTravelDocumentAction } from "@/features/documents/actions";
import { TransportForm } from "@/features/transport/TransportForm.client";
import {
  createEmptyTransportFormValues,
  toTransportFormValues,
} from "@/features/transport/transport-form-defaults";
import {
  TRANSPORT_TYPES,
  TRANSPORT_TYPE_LABELS,
} from "@/features/transport/transport-types";
import type { TransportRecord } from "@/features/transport/types";
import {
  createTripReminderAction,
  updateTripReminderAction,
  type TripReminderActionState,
} from "@/features/trips/reminders/actions";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import reminderStyles from "@/features/trips/reminders/TripReminderSettings.module.scss";
import type { DayDocumentLinkOptions } from "./build-day-document-link-options";
import { ACTIVITY_TYPES } from "./activity-types";
import { ActivityForm } from "./ActivityForm";
import { ActivityMovePanel } from "./ActivityMovePanel";
import { confirmDayActionDiscard } from "./confirm-day-action-discard";
import { DAY_ADD_MENU_OPTIONS, getDayActionSurfaceTitle } from "./day-action-menu";
import type { DayActionState, DayAddMenuAction } from "./day-action-surface.types";
import {
  emptyActivityFormValues,
  toActivityFormValues,
} from "./to-activity-view-model";
import type { ActivityViewModel } from "./types";
import styles from "./DayPage.module.scss";

const reminderInitialState: TripReminderActionState = {};

const MENU_ICONS = {
  activity: IconActivityAttraction,
  transport: IconActivityTransport,
  document: IconDocuments,
  reminder: IconCalendar,
} as const;

type DayActionSurfaceProps = {
  state: DayActionState;
  tripId: string;
  startDate: string;
  endDate: string;
  date: string;
  tripDates: readonly string[];
  activities: readonly ActivityViewModel[];
  transportRecords: ReadonlyMap<string, TransportRecord>;
  documentLinkOptions: DayDocumentLinkOptions;
  reminders: readonly TripReminderViewModel[];
  onStateChange: (state: DayActionState) => void;
  onClose: () => void;
  showCostFields?: boolean;
  financeBaseCurrency?: string;
  currencies?: readonly import("@/features/currency/types").CurrencyOption[];
};

function ReminderCreateForm({
  tripId,
  date,
  onCancel,
  onSuccess,
  onDirtyChange,
}: {
  tripId: string;
  date: string;
  onCancel: () => void;
  onSuccess: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [createState, createAction] = useActionState(
    createTripReminderAction,
    reminderInitialState,
  );

  useEffect(() => {
    if (createState.ok) {
      onSuccess();
    }
  }, [createState.ok, onSuccess]);

  return (
    <form
      action={createAction}
      className={reminderStyles.createForm}
      onChange={() => onDirtyChange(true)}
      onInput={() => onDirtyChange(true)}
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="date" value={date} />
      <Field label="שעה" htmlFor="day-action-reminder-time">
        <Input id="day-action-reminder-time" name="time" type="time" required />
      </Field>
      <Field label="תוכן התזכורת" htmlFor="day-action-reminder-text">
        <Textarea id="day-action-reminder-text" name="text" rows={3} required />
      </Field>
      {createState.error ? (
        <p className={reminderStyles.error} role="alert">
          {createState.error}
        </p>
      ) : null}
      <div className={reminderStyles.rowActions}>
        <AuthSubmitButton>הוספה</AuthSubmitButton>
        <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  );
}

function ReminderEditForm({
  tripId,
  startDate,
  endDate,
  reminder,
  onCancel,
  onSuccess,
  onDirtyChange,
}: {
  tripId: string;
  startDate: string;
  endDate: string;
  reminder: TripReminderViewModel;
  onCancel: () => void;
  onSuccess: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [updateState, updateAction] = useActionState(
    updateTripReminderAction,
    reminderInitialState,
  );

  useEffect(() => {
    if (updateState.ok) {
      onSuccess();
    }
  }, [updateState.ok, onSuccess]);

  return (
    <form
      action={updateAction}
      className={reminderStyles.editForm}
      onChange={() => onDirtyChange(true)}
      onInput={() => onDirtyChange(true)}
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="reminderId" value={reminder.id} />
      <div className={reminderStyles.formRow}>
        <Field label="תאריך" htmlFor={`day-action-edit-date-${reminder.id}`}>
          <Input
            id={`day-action-edit-date-${reminder.id}`}
            name="date"
            type="date"
            defaultValue={reminder.date}
            min={startDate}
            max={endDate}
            required
          />
        </Field>
        <Field label="שעה" htmlFor={`day-action-edit-time-${reminder.id}`}>
          <Input
            id={`day-action-edit-time-${reminder.id}`}
            name="time"
            type="time"
            defaultValue={reminder.time}
            required
          />
        </Field>
      </div>
      <Field label="תוכן התזכורת" htmlFor={`day-action-edit-text-${reminder.id}`}>
        <Textarea
          id={`day-action-edit-text-${reminder.id}`}
          name="text"
          defaultValue={reminder.text}
          rows={3}
          required
        />
      </Field>
      {updateState.error ? (
        <p className={reminderStyles.error} role="alert">
          {updateState.error}
        </p>
      ) : null}
      <div className={reminderStyles.rowActions}>
        <AuthSubmitButton>שמירה</AuthSubmitButton>
        <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  );
}

export function DayActionSurface({
  state,
  tripId,
  startDate,
  endDate,
  date,
  tripDates,
  activities,
  transportRecords,
  documentLinkOptions,
  reminders,
  onStateChange,
  onClose,
  showCostFields = false,
  financeBaseCurrency = "ILS",
  currencies = [],
}: DayActionSurfaceProps) {
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [dirty, setDirty] = useState(false);

  const isOpen = state.kind !== "closed";
  const isFormState = state.kind !== "closed" && state.kind !== "menu";

  const requestClose = useCallback(() => {
    if (!confirmDayActionDiscard(dirty)) {
      return;
    }
    setDirty(false);
    onClose();
  }, [dirty, onClose]);

  const handleMutationSuccess = useCallback(() => {
    setDirty(false);
    onClose();
    router.refresh();
  }, [onClose, router]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    triggerRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        requestClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [isOpen, requestClose]);

  function handleMenuSelect(action: DayAddMenuAction) {
    setDirty(false);
    if (action === "transport") {
      onStateChange({ kind: "transport-type" });
      return;
    }
    if (action === "activity") {
      onStateChange({ kind: "activity-create" });
      return;
    }
    if (action === "document") {
      onStateChange({ kind: "document-create" });
      return;
    }
    onStateChange({ kind: "reminder-create" });
  }

  function handleTransportTypeSelect(transportType: (typeof TRANSPORT_TYPES)[number]) {
    setDirty(false);
    onStateChange({ kind: "transport-create", transportType });
  }

  if (!isOpen) {
    return null;
  }

  const title = getDayActionSurfaceTitle(state);
  const activity =
    state.kind === "activity-edit" || state.kind === "activity-move"
      ? activities.find((item) => item.id === state.activityId)
      : undefined;
  const transportRecord =
    state.kind === "transport-edit"
      ? transportRecords.get(state.transportId)
      : undefined;
  const reminder =
    state.kind === "reminder-edit"
      ? reminders.find((item) => item.id === state.reminderId)
      : undefined;

  return (
    <div className={styles.sheetRoot}>
      <button
        type="button"
        className={styles.sheetBackdrop}
        aria-label="סגירה"
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        className={isFormState ? styles.sheetPanelForm : styles.sheetPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.sheetHeader}>
          <h2 id={titleId} className={styles.sheetTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.sheetCloseButton}
            aria-label="סגירה"
            onClick={requestClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.sheetBody}>
          {state.kind === "menu" ? (
            <ul className={styles.sheetOptions}>
              {DAY_ADD_MENU_OPTIONS.map((option) => {
                const Icon = MENU_ICONS[option.id];
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      className={styles.sheetOption}
                      onClick={() => handleMenuSelect(option.id)}
                    >
                      <Icon className={styles.sheetOptionIcon} aria-hidden />
                      <span>{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {state.kind === "activity-create" ? (
            <ActivityForm
              key={`create-${date}`}
              tripId={tripId}
              tripDates={tripDates}
              mode="create"
              lockDate
              defaultValues={emptyActivityFormValues({
                date,
                type: ACTIVITY_TYPES[0],
              })}
              onCancel={requestClose}
              onSuccess={handleMutationSuccess}
              onDirtyChange={setDirty}
              showCostFields={showCostFields}
              financeBaseCurrency={financeBaseCurrency}
              currencies={currencies}
            />
          ) : null}

          {state.kind === "activity-edit" && activity ? (
            <ActivityForm
              key={`edit-${activity.id}`}
              tripId={tripId}
              tripDates={tripDates}
              mode="edit"
              activityId={activity.id}
              lockDate
              defaultValues={toActivityFormValues(activity)}
              onCancel={requestClose}
              onSuccess={handleMutationSuccess}
              onDirtyChange={setDirty}
              showCostFields={showCostFields}
              financeBaseCurrency={financeBaseCurrency}
              currencies={currencies}
              linkedCost={activity.linkedCost}
            />
          ) : null}

          {state.kind === "activity-move" && activity ? (
            <div onChange={() => setDirty(true)} onInput={() => setDirty(true)}>
              <ActivityMovePanel
                tripId={tripId}
                activity={activity}
                tripDates={tripDates}
                onCancel={requestClose}
                onSuccess={handleMutationSuccess}
              />
            </div>
          ) : null}

          {state.kind === "transport-type" ? (
            <ul className={styles.transportTypeList}>
              {TRANSPORT_TYPES.map((type) => (
                <li key={type}>
                  <button
                    type="button"
                    className={styles.sheetOption}
                    onClick={() => handleTransportTypeSelect(type)}
                  >
                    {TRANSPORT_TYPE_LABELS[type]}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {state.kind === "transport-create" ? (
            <div onChange={() => setDirty(true)} onInput={() => setDirty(true)}>
              <TransportForm
                key={`transport-create-${state.transportType}-${date}`}
                tripId={tripId}
                mode="create"
                defaultValues={{
                  ...createEmptyTransportFormValues(state.transportType),
                  departureDate: date,
                }}
                onCancel={requestClose}
                onSuccess={handleMutationSuccess}
              />
            </div>
          ) : null}

          {state.kind === "transport-edit" && transportRecord ? (
            <div onChange={() => setDirty(true)} onInput={() => setDirty(true)}>
              <TransportForm
                key={`transport-edit-${transportRecord.id}`}
                tripId={tripId}
                mode="edit"
                transportId={transportRecord.id}
                defaultValues={toTransportFormValues(transportRecord)}
                onCancel={requestClose}
                onSuccess={handleMutationSuccess}
              />
            </div>
          ) : null}

          {state.kind === "document-create" ? (
            <div onChange={() => setDirty(true)} onInput={() => setDirty(true)}>
              <TripDocumentForm
                tripId={tripId}
                activityOptions={documentLinkOptions.activityOptions}
                accommodationOptions={documentLinkOptions.accommodationOptions}
                transportOptions={documentLinkOptions.transportOptions}
                action={createTravelDocumentAction}
                submitLabel="הוספה"
                includeFile
                initialLinkType={documentLinkOptions.initialLinkType}
                initialActivityId={documentLinkOptions.initialActivityId}
                initialAccommodationId={documentLinkOptions.initialAccommodationId}
                initialTransportId={documentLinkOptions.initialTransportId}
                onCancel={requestClose}
                onSuccess={handleMutationSuccess}
              />
            </div>
          ) : null}

          {state.kind === "reminder-create" ? (
            <ReminderCreateForm
              tripId={tripId}
              date={date}
              onCancel={requestClose}
              onSuccess={handleMutationSuccess}
              onDirtyChange={setDirty}
            />
          ) : null}

          {state.kind === "reminder-edit" && reminder ? (
            <ReminderEditForm
              tripId={tripId}
              startDate={startDate}
              endDate={endDate}
              reminder={reminder}
              onCancel={requestClose}
              onSuccess={handleMutationSuccess}
              onDirtyChange={setDirty}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
