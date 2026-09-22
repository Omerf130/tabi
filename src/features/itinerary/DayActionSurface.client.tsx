"use client";

import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { createAccommodationAction } from "@/features/accommodations/actions";
import { TripAccommodationForm } from "@/features/accommodations/TripAccommodationSettings";
import { TripDocumentForm } from "@/features/documents/TripDocumentSettings";
import { createTravelDocumentAction } from "@/features/documents/actions";
import { TransportForm } from "@/features/transport/TransportForm.client";
import {
  createEmptyTransportFormValues,
  toTransportFormValues,
} from "@/features/transport/transport-form-defaults";
import type { TransportRecord } from "@/features/transport/types";
import {
  updateTripReminderAction,
  type TripReminderActionState,
} from "@/features/trips/reminders/actions";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import { ReminderPushAwarenessCallout } from "@/features/push/ReminderPushAwarenessCallout.client";
import { TripReminderBrowserTimeZoneField } from "@/features/trips/reminders/TripReminderBrowserTimeZoneField.client";
import { translateReminderError } from "@/features/trips/reminders/translate-reminder-error";
import reminderStyles from "@/features/trips/reminders/TripReminderSettings.module.scss";
import type { DayDocumentLinkOptions } from "./build-day-document-link-options";
import { ACTIVITY_TYPES } from "./activity-types";
import { ActivityForm } from "./ActivityForm";
import { ActivityMovePanel } from "./ActivityMovePanel";
import { confirmDayActionDiscard } from "./confirm-day-action-discard";
import { getDayActionSurfaceTitle } from "./day-action-menu";
import {
  canDayActionGoBack,
  getDayActionBackTarget,
  shouldShowDayContext,
} from "./day-action-navigation";
import { DayAddItemChooser } from "./DayAddItemChooser.client";
import { formatActivityFormDayContext } from "./format-activity-form-day-context";
import { TransportTypeChooser } from "./TransportTypeChooser.client";
import type { DayActionState, DayAddMenuAction } from "./day-action-surface.types";
import {
  emptyActivityFormValues,
  toActivityFormValues,
} from "./to-activity-view-model";
import type { ActivityViewModel } from "./types";
import overlayStyles from "./AddItemFlow.module.scss";
import styles from "./DayPage.module.scss";

const reminderInitialState: TripReminderActionState = {};

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
  onOpenReminderQuickAdd?: () => void;
  reminderNotificationsReturnTo: string;
  showCostFields?: boolean;
  financeBaseCurrency?: string;
  currencies?: readonly import("@/features/currency/types").CurrencyOption[];
  destinationCalendarTimeZone?: string;
  destinationCountryCode?: string | null;
};

function ReminderEditForm({
  tripId,
  startDate,
  endDate,
  reminder,
  notificationsReturnTo,
  onCancel,
  onSuccess,
  onDirtyChange,
}: {
  tripId: string;
  startDate: string;
  endDate: string;
  reminder: TripReminderViewModel;
  notificationsReturnTo: string;
  onCancel: () => void;
  onSuccess: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const t = useTranslations("Itinerary");
  const tReminders = useTranslations("TripReminders");
  const tCommon = useTranslations("Common");
  const [updateState, updateAction] = useActionState(
    updateTripReminderAction,
    reminderInitialState,
  );
  const updateError = translateReminderError(tReminders, updateState.errorCode);

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
      <TripReminderBrowserTimeZoneField />
      <div className={reminderStyles.formRow}>
        <Field label={tCommon("date")} htmlFor={`day-action-edit-date-${reminder.id}`}>
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
        <Field label={tCommon("time")} htmlFor={`day-action-edit-time-${reminder.id}`}>
          <Input
            id={`day-action-edit-time-${reminder.id}`}
            name="time"
            type="time"
            defaultValue={reminder.time}
            required
          />
        </Field>
      </div>
      <Field label={t("dayActionReminderContent")} htmlFor={`day-action-edit-text-${reminder.id}`}>
        <Textarea
          id={`day-action-edit-text-${reminder.id}`}
          name="text"
          defaultValue={reminder.text}
          rows={3}
          required
        />
      </Field>
      <ReminderPushAwarenessCallout returnTo={notificationsReturnTo} />
      {updateError ? (
        <p className={reminderStyles.error} role="alert">
          {updateError}
        </p>
      ) : null}
      <div className={reminderStyles.rowActions}>
        <AuthSubmitButton>{tCommon("save")}</AuthSubmitButton>
        <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
          {tCommon("cancel")}
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
  onOpenReminderQuickAdd,
  reminderNotificationsReturnTo,
  showCostFields = false,
  financeBaseCurrency = "ILS",
  currencies = [],
  destinationCalendarTimeZone = "UTC",
  destinationCountryCode,
}: DayActionSurfaceProps) {
  const t = useTranslations("Itinerary");
  const tActivity = useTranslations("Activity");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [dirty, setDirty] = useState(false);

  const isOpen = state.kind !== "closed";
  const isFormState = state.kind !== "closed" && state.kind !== "menu";
  const showBack = canDayActionGoBack(state);
  const dayContextLabel = shouldShowDayContext(state)
    ? formatActivityFormDayContext(startDate, endDate, date, tCommon)
    : state.kind === "menu"
      ? formatActivityFormDayContext(startDate, endDate, date, tCommon)
      : null;

  const requestCloseRef = useRef<() => void>(() => {});

  const requestClose = useCallback(() => {
    if (!confirmDayActionDiscard(dirty, tActivity)) {
      return;
    }
    setDirty(false);
    onClose();
  }, [dirty, onClose, tActivity]);

  useEffect(() => {
    requestCloseRef.current = requestClose;
  }, [requestClose]);

  const requestBack = useCallback(() => {
    if (!confirmDayActionDiscard(dirty, tActivity)) {
      return;
    }
    setDirty(false);
    const target = getDayActionBackTarget(state);
    if (target) {
      onStateChange(target);
    }
  }, [dirty, onStateChange, state, tActivity]);

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
        requestCloseRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [isOpen]);

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
    if (action === "accommodation") {
      onStateChange({ kind: "accommodation-create" });
      return;
    }
    if (action === "document") {
      onStateChange({ kind: "document-create" });
      return;
    }
    if (onOpenReminderQuickAdd) {
      onOpenReminderQuickAdd();
      onClose();
      return;
    }
    onStateChange({ kind: "menu" });
  }

  function handleTransportTypeSelect(
    transportType: Parameters<typeof createEmptyTransportFormValues>[0],
  ) {
    setDirty(false);
    onStateChange({ kind: "transport-create", transportType });
  }

  function handleTransportTypeChange(
    transportType: Parameters<typeof createEmptyTransportFormValues>[0],
  ) {
    if (state.kind !== "transport-create") {
      return;
    }
    setDirty(false);
    onStateChange({ kind: "transport-create", transportType });
  }

  if (!isOpen) {
    return null;
  }

  const title = getDayActionSurfaceTitle(state, t);
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
        aria-label={t("dayActionCloseAria")}
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        className={
          state.kind === "menu" || isFormState ? styles.sheetPanelForm : styles.sheetPanel
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.sheetHeader}>
          {showBack ? (
            <button
              type="button"
              className={styles.sheetBackButton}
              aria-label={t("dayActionBackAria")}
              onClick={requestBack}
            >
              ←
            </button>
          ) : (
            <span className={styles.sheetBackSpacer} aria-hidden />
          )}

          <div className={styles.sheetHeaderTitles}>
            <h2 id={titleId} className={styles.sheetTitle}>
              {title}
            </h2>
            {dayContextLabel ? (
              <p className={styles.sheetSubtitle}>{dayContextLabel}</p>
            ) : null}
          </div>

          <button
            type="button"
            className={styles.sheetCloseButton}
            aria-label={t("dayActionCloseAria")}
            onClick={requestClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.sheetBody}>
          {state.kind === "menu" ? (
            <DayAddItemChooser onSelect={handleMenuSelect} />
          ) : null}

          {state.kind === "activity-create" ? (
            <ActivityForm
              key={`create-${date}`}
              tripId={tripId}
              tripDates={tripDates}
              mode="create"
              lockDate
              overlayNavigation
              defaultValues={emptyActivityFormValues({
                date,
                type: ACTIVITY_TYPES[0],
              })}
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
            <TransportTypeChooser onSelect={handleTransportTypeSelect} />
          ) : null}

          {state.kind === "transport-create" ? (
            <div onChange={() => setDirty(true)} onInput={() => setDirty(true)}>
              <TransportForm
                key={`transport-create-${state.transportType}-${date}`}
                tripId={tripId}
                destinationCountryCode={destinationCountryCode}
                mode="create"
                overlayNavigation
                plannerPresentation
                transportType={state.transportType}
                onTransportTypeChange={handleTransportTypeChange}
                defaultValues={{
                  ...createEmptyTransportFormValues(
                    state.transportType,
                    destinationCalendarTimeZone,
                  ),
                  departureDate: date,
                }}
                onSuccess={handleMutationSuccess}
                financeBaseCurrency={financeBaseCurrency}
                currencies={showCostFields ? currencies : []}
              />
            </div>
          ) : null}

          {state.kind === "transport-edit" && transportRecord ? (
            <div onChange={() => setDirty(true)} onInput={() => setDirty(true)}>
              <TransportForm
                key={`transport-edit-${transportRecord.id}`}
                tripId={tripId}
                destinationCountryCode={destinationCountryCode}
                mode="edit"
                transportId={transportRecord.id}
                defaultValues={toTransportFormValues(transportRecord)}
                onCancel={requestClose}
                onSuccess={handleMutationSuccess}
                financeBaseCurrency={financeBaseCurrency}
                currencies={showCostFields ? currencies : []}
                linkedCost={undefined}
                plannerPresentation
              />
            </div>
          ) : null}

          {state.kind === "accommodation-create" ? (
            <TripAccommodationForm
              tripId={tripId}
              startDate={startDate}
              endDate={endDate}
              destinationCountryCode={destinationCountryCode}
              idPrefix="day-add-accommodation"
              action={createAccommodationAction}
              submitLabel={t("dayActionAddAccommodation")}
              defaultCheckInDate={date}
              overlayNavigation
              plannerPresentation
              onSuccess={handleMutationSuccess}
              financeBaseCurrency={financeBaseCurrency}
              currencies={showCostFields ? currencies : []}
            />
          ) : null}

          {state.kind === "document-create" ? (
            <div
              className={overlayStyles.plannerForm}
              onChange={() => setDirty(true)}
              onInput={() => setDirty(true)}
            >
              <TripDocumentForm
                tripId={tripId}
                activityOptions={documentLinkOptions.activityOptions}
                accommodationOptions={documentLinkOptions.accommodationOptions}
                transportOptions={documentLinkOptions.transportOptions}
                action={createTravelDocumentAction}
                submitLabel={t("dayActionAddDocument")}
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

          {state.kind === "reminder-edit" && reminder ? (
            <ReminderEditForm
              tripId={tripId}
              startDate={startDate}
              endDate={endDate}
              reminder={reminder}
              notificationsReturnTo={reminderNotificationsReturnTo}
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
