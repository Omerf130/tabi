"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { createAccommodationAction } from "@/features/accommodations/actions";
import { TripAccommodationForm } from "@/features/accommodations/TripAccommodationSettings";
import { createTravelDocumentAction } from "@/features/documents/actions";
import { TripDocumentForm } from "@/features/documents/TripDocumentSettings";
import { FinanceExpenseSheet } from "@/features/finance/FinanceExpenseSheet.client";
import { ACTIVITY_TYPES } from "@/features/itinerary/activity-types";
import { ActivityForm } from "@/features/itinerary/ActivityForm";
import { emptyActivityFormValues } from "@/features/itinerary/to-activity-view-model";
import overlayStyles from "@/features/itinerary/AddItemFlow.module.scss";
import { TransportForm } from "@/features/transport/TransportForm.client";
import { createEmptyTransportFormValues } from "@/features/transport/transport-form-defaults";
import type { TransportType } from "@/features/transport/transport-types";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { createTripReminderAction, type TripReminderActionState } from "@/features/trips/reminders/actions";
import { translateReminderError } from "@/features/trips/reminders/translate-reminder-error";
import { ReminderPushAwarenessCallout } from "@/features/push/ReminderPushAwarenessCallout.client";
import { TripReminderCreateFields } from "@/features/trips/reminders/TripReminderCreateFields.client";
import reminderStyles from "@/features/trips/reminders/TripReminderSettings.module.scss";
import { QuickAddPinnedFields } from "./QuickAddPinnedFields.client";
import {
  mergePlannerPinnedFormClass,
  resolvePinnedPlannerFooterClass,
} from "./quick-add-pinned-form";
import type { QuickAddBootstrap, QuickAddContext, QuickAddStep } from "./types";
import styles from "./QuickAdd.module.scss";

const reminderInitialState: TripReminderActionState = {};

type QuickAddFormsProps = {
  step: QuickAddStep;
  context: QuickAddContext;
  bootstrap: QuickAddBootstrap;
  /** Mobile bottom-sheet only: pin primary action outside field scroll. */
  pinnedActionFooter?: boolean;
  onSuccess: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onTransportTypeChange: (transportType: TransportType) => void;
};

function QuickAddFormMount({ children }: { children: ReactNode }) {
  return <div className={styles.quickAddFormMount}>{children}</div>;
}

function resolveDocumentLink(context: QuickAddContext) {
  const defaults = context.linkDefaults;
  if (defaults?.activityId) {
    return {
      initialLinkType: "activity" as const,
      initialActivityId: defaults.activityId,
    };
  }
  if (defaults?.accommodationId) {
    return {
      initialLinkType: "accommodation" as const,
      initialAccommodationId: defaults.accommodationId,
    };
  }
  if (defaults?.transportId) {
    return {
      initialLinkType: "transport" as const,
      initialTransportId: defaults.transportId,
    };
  }
  return { initialLinkType: "none" as const };
}

function QuickAddReminderForm({
  context,
  bootstrap,
  pinnedActionFooter,
  onSuccess,
  onDirtyChange,
}: {
  context: QuickAddContext;
  bootstrap: QuickAddBootstrap;
  pinnedActionFooter: boolean;
  onSuccess: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const t = useTranslations("Itinerary");
  const tReminders = useTranslations("TripReminders");
  const [createState, createAction] = useActionState(
    createTripReminderAction,
    reminderInitialState,
  );
  const createError = translateReminderError(tReminders, createState.errorCode);
  const lockDate = Boolean(context.date);

  useEffect(() => {
    if (createState.ok) {
      onSuccess();
    }
  }, [createState.ok, onSuccess]);

  const footerClass = resolvePinnedPlannerFooterClass(
    pinnedActionFooter,
    overlayStyles.plannerFooter,
  );

  return (
    <QuickAddFormMount>
      <form
        action={createAction}
        className={mergePlannerPinnedFormClass(
          overlayStyles.plannerForm,
          pinnedActionFooter,
        )}
        onChange={() => onDirtyChange(true)}
        onInput={() => onDirtyChange(true)}
      >
        <QuickAddPinnedFields pinnedActionFooter={pinnedActionFooter}>
          <TripReminderCreateFields
            tripId={context.tripId}
            startDate={bootstrap.startDate}
            endDate={bootstrap.endDate}
            defaultDate={context.date}
            lockDate={lockDate}
            idPrefix="quick-add-reminder"
            rows={3}
          />
          <ReminderPushAwarenessCallout
            returnTo={context.originPath ?? `/app/trips/${context.tripId}`}
          />
          {createError ? (
            <p className={reminderStyles.error} role="alert">
              {createError}
            </p>
          ) : null}
        </QuickAddPinnedFields>
        <div className={footerClass}>
          <AuthSubmitButton>{t("dayActionReminderAdd")}</AuthSubmitButton>
        </div>
      </form>
    </QuickAddFormMount>
  );
}

export function QuickAddForms({
  step,
  context,
  bootstrap,
  pinnedActionFooter = false,
  onSuccess,
  onDirtyChange,
  onTransportTypeChange,
}: QuickAddFormsProps) {
  const t = useTranslations("Itinerary");

  if (step.kind !== "form") {
    return null;
  }

  const date = context.date;
  const documentLink = resolveDocumentLink(context);

  switch (step.action) {
    case "activity":
      return (
        <QuickAddFormMount>
          <div className={styles.quickAddFormInner}>
          <ActivityForm
            key={`qa-activity-${date ?? "open"}`}
            tripId={context.tripId}
            tripDates={bootstrap.tripDates}
            mode="create"
            lockDate={Boolean(date)}
            overlayNavigation
            pinnedActionFooter={pinnedActionFooter}
            defaultValues={emptyActivityFormValues({
              date: date ?? bootstrap.startDate,
              type: ACTIVITY_TYPES[0],
            })}
            onSuccess={onSuccess}
            onDirtyChange={onDirtyChange}
            showCostFields={bootstrap.showCostFields}
            financeBaseCurrency={bootstrap.financeBaseCurrency}
            currencies={bootstrap.currencies}
          />
          </div>
        </QuickAddFormMount>
      );
    case "accommodation":
      return (
        <QuickAddFormMount>
          <div className={styles.quickAddFormInner}>
          <TripAccommodationForm
            tripId={context.tripId}
            startDate={bootstrap.startDate}
            endDate={bootstrap.endDate}
            idPrefix="quick-add-accommodation"
            action={createAccommodationAction}
            submitLabel={t("dayActionAddAccommodation")}
            defaultCheckInDate={date}
            overlayNavigation
            plannerPresentation
            pinnedActionFooter={pinnedActionFooter}
            onSuccess={onSuccess}
            financeBaseCurrency={bootstrap.financeBaseCurrency}
            currencies={bootstrap.showCostFields ? bootstrap.currencies : []}
          />
          </div>
        </QuickAddFormMount>
      );
    case "transport":
      if (!step.transportType) {
        return null;
      }
      return (
        <QuickAddFormMount>
          <div
            className={styles.quickAddFormInner}
            onChange={() => onDirtyChange(true)}
            onInput={() => onDirtyChange(true)}
          >
            <TransportForm
              key={`qa-transport-${step.transportType}-${date ?? ""}`}
              tripId={context.tripId}
              mode="create"
              overlayNavigation
              plannerPresentation
              pinnedActionFooter={pinnedActionFooter}
              transportType={step.transportType as TransportType}
              onTransportTypeChange={(transportType) => {
                onDirtyChange(false);
                onTransportTypeChange(transportType);
              }}
              defaultValues={{
                ...createEmptyTransportFormValues(
                  step.transportType as TransportType,
                  bootstrap.destinationCalendarTimeZone,
                ),
                ...(date ? { departureDate: date } : {}),
              }}
              onSuccess={onSuccess}
              financeBaseCurrency={bootstrap.financeBaseCurrency}
              currencies={bootstrap.showCostFields ? bootstrap.currencies : []}
            />
          </div>
        </QuickAddFormMount>
      );
    case "reminder":
      return (
        <QuickAddReminderForm
          context={context}
          bootstrap={bootstrap}
          pinnedActionFooter={pinnedActionFooter}
          onSuccess={onSuccess}
          onDirtyChange={onDirtyChange}
        />
      );
    case "expense":
      return (
        <QuickAddFormMount>
          <div className={styles.quickAddFormInner}>
          <FinanceExpenseSheet
            tripId={context.tripId}
            baseCurrency={bootstrap.financeBaseCurrency}
            currencies={bootstrap.currencies}
            defaultExpenseDate={date}
            presentation="embedded"
            pinnedActionFooter={pinnedActionFooter}
            onClose={() => {}}
            onDirtyChange={onDirtyChange}
            onCreateSuccess={onSuccess}
          />
          </div>
        </QuickAddFormMount>
      );
    case "document":
      return (
        <QuickAddFormMount>
          <div
            className={styles.quickAddFormInner}
            onChange={() => onDirtyChange(true)}
            onInput={() => onDirtyChange(true)}
          >
            <TripDocumentForm
              tripId={context.tripId}
              activityOptions={bootstrap.documentLinkOptions.activityOptions}
              accommodationOptions={bootstrap.documentLinkOptions.accommodationOptions}
              transportOptions={bootstrap.documentLinkOptions.transportOptions}
              action={createTravelDocumentAction}
              submitLabel={t("dayActionAddDocument")}
              includeFile
              initialLinkType={documentLink.initialLinkType}
              initialActivityId={
                "initialActivityId" in documentLink ? documentLink.initialActivityId : undefined
              }
              initialAccommodationId={
                "initialAccommodationId" in documentLink
                  ? documentLink.initialAccommodationId
                  : undefined
              }
              initialTransportId={
                "initialTransportId" in documentLink ? documentLink.initialTransportId : undefined
              }
              onSuccess={onSuccess}
              overlayActionFooter
              pinnedActionFooter={pinnedActionFooter}
            />
          </div>
        </QuickAddFormMount>
      );
    default:
      return null;
  }
}
