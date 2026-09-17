"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { ACTIVITY_TYPES, type ActivityType } from "./activity-types";
import { translateActivityError } from "./translate-activity-error";
import {
  createActivityAction,
  updateActivityAction,
  type ActivityActionState,
} from "./actions";
import type { CurrencyOption } from "@/features/currency/types";
import { EntityCostFields } from "@/features/finance/EntityCostFields.client";
import type { EntityLinkedCostViewModel } from "@/features/finance/types";
import { PlaceModeSegment } from "./PlaceModeSegment.client";
import { ActivityDeleteControl } from "./ActivityDeleteControl.client";
import {
  ActivityLocationSection,
  type ActivityPlaceMode,
} from "./ActivityLocationSection";
import { shouldExpandActivityDetails } from "./should-expand-activity-details";
import type { ActivityFormValues } from "./types";
import { QuickAddPinnedFields } from "@/features/quick-add/QuickAddPinnedFields.client";
import {
  mergePlannerPinnedFormClass,
  resolvePinnedPlannerFooterClass,
} from "@/features/quick-add/quick-add-pinned-form";
import overlayStyles from "./AddItemFlow.module.scss";
import styles from "./ActivityForm.module.scss";

const initialState: ActivityActionState = {};

function resolveInitialPlaceMode(
  defaultValues: ActivityFormValues,
  mode: "create" | "edit",
): ActivityPlaceMode {
  if (mode === "edit") {
    return defaultValues.placeSource === "google" && defaultValues.googlePlaceId
      ? "google"
      : "manual";
  }
  return "google";
}

type ActivityFormProps = {
  tripId: string;
  tripDates: readonly string[];
  defaultValues: ActivityFormValues;
  mode: "create" | "edit";
  activityId?: string;
  lockDate?: boolean;
  onCancel?: () => void;
  overlayNavigation?: boolean;
  onSuccess?: (result: ActivityActionState) => void;
  onDirtyChange?: (dirty: boolean) => void;
  showCostFields?: boolean;
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
  linkedCost?: EntityLinkedCostViewModel | null;
  pinnedActionFooter?: boolean;
};

export function ActivityForm({
  tripId,
  tripDates,
  defaultValues,
  mode,
  activityId,
  lockDate = false,
  onCancel,
  overlayNavigation = false,
  onSuccess,
  onDirtyChange,
  showCostFields = false,
  financeBaseCurrency = "ILS",
  currencies = [],
  linkedCost,
  pinnedActionFooter = false,
}: ActivityFormProps) {
  const t = useTranslations("Activity");
  const tCommon = useTranslations("Common");
  const action = mode === "create" ? createActivityAction : updateActivityAction;
  const [state, formAction] = useActionState(action, initialState);
  const titleRef = useRef<HTMLInputElement>(null);
  const [placeMode, setPlaceMode] = useState<ActivityPlaceMode>(() =>
    resolveInitialPlaceMode(defaultValues, mode),
  );
  const [hasGooglePlace, setHasGooglePlace] = useState(
    Boolean(defaultValues.googlePlaceId),
  );
  const detailsExpanded = shouldExpandActivityDetails(defaultValues, mode);
  const showDetails =
    mode === "edit" || placeMode === "manual" || hasGooglePlace;

  useEffect(() => {
    if (state.ok && onSuccess) {
      onSuccess(state);
    }
  }, [state, onSuccess]);

  useEffect(() => {
    if (!showDetails || mode !== "create") {
      return;
    }

    titleRef.current?.focus({ preventScroll: true });
  }, [mode, showDetails]);

  function handleChange() {
    onDirtyChange?.(true);
  }

  function handlePlaceModeChange(nextMode: ActivityPlaceMode) {
    setPlaceMode(nextMode);
    setHasGooglePlace(false);
    handleChange();
  }

  function handleGoogleSelectionChange(input: {
    hasSelection: boolean;
    locationName?: string;
  }) {
    setHasGooglePlace(input.hasSelection);
    if (
      input.hasSelection &&
      input.locationName &&
      titleRef.current &&
      !titleRef.current.value.trim()
    ) {
      titleRef.current.value = input.locationName;
      handleChange();
    }
  }

  const footerClass = resolvePinnedPlannerFooterClass(
    pinnedActionFooter,
    styles.formFooter,
  );

  return (
    <form
      action={formAction}
      className={mergePlannerPinnedFormClass(styles.form, pinnedActionFooter)}
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

      <QuickAddPinnedFields pinnedActionFooter={pinnedActionFooter}>
      <div
        className={
          overlayNavigation ? `${styles.formBody} ${styles.formBodyPlanner}` : styles.formBody
        }
      >
        {state.error ? (
          <p className={styles.formError} role="alert">
            {translateActivityError(t, state.error)}
          </p>
        ) : null}

        {overlayNavigation ? (
          <div className={overlayStyles.searchGroup}>
            <PlaceModeSegment
              mode={placeMode}
              onChange={handlePlaceModeChange}
              googleLabel={t("placeSearchGoogle")}
              manualLabel={t("placeSearchManual")}
            />
            {placeMode === "google" ? (
              <>
                <p id="activity-place-label" className={overlayStyles.searchGroupLabel}>
                  {t("whereQuestion")}
                </p>
                <ActivityLocationSection
                  tripId={tripId}
                  defaultValues={defaultValues}
                  placeMode="google"
                  fieldErrors={state.fieldErrors}
                  onDirtyChange={handleChange}
                  onGoogleSelectionChange={handleGoogleSelectionChange}
                  plannerPresentation
                />
              </>
            ) : null}
          </div>
        ) : (
          <>
            <PlaceModeSegment
              mode={placeMode}
              onChange={handlePlaceModeChange}
              googleLabel={t("placeSearchGoogle")}
              manualLabel={t("placeSearchManual")}
            />
            {placeMode === "google" ? (
              <section className={styles.section} aria-labelledby="activity-place-label">
                {!showDetails ? (
                  <h3 id="activity-place-label" className={styles.sectionLabel}>
                    {t("whereQuestion")}
                  </h3>
                ) : null}
                <ActivityLocationSection
                  tripId={tripId}
                  defaultValues={defaultValues}
                  placeMode="google"
                  fieldErrors={state.fieldErrors}
                  onDirtyChange={handleChange}
                  onGoogleSelectionChange={handleGoogleSelectionChange}
                />
              </section>
            ) : null}
          </>
        )}

        {showDetails ? (
          <>
            <div className={styles.primaryField}>
              <label className={styles.primaryLabel} htmlFor="activity-title">
                {t("whatQuestion")}
              </label>
              <input
                ref={titleRef}
                id="activity-title"
                className={styles.primaryInput}
                name="title"
                defaultValue={defaultValues.title}
                placeholder="TeamLab Planets"
                required
                maxLength={120}
                dir="auto"
                aria-invalid={state.fieldErrors?.title ? true : undefined}
              />
              {state.fieldErrors?.title ? (
                <p className={styles.formError} role="alert">
                  {translateActivityError(t, state.fieldErrors.title)}
                </p>
              ) : null}
            </div>

            <section className={styles.section} aria-labelledby="activity-time-label">
              <h3 id="activity-time-label" className={styles.sectionLabel}>
                {overlayNavigation ? tCommon("time") : t("whenQuestion")}
              </h3>
              <div className={styles.timeRow}>
                <div className={styles.timeField}>
                  <label className={styles.timeFieldLabel} htmlFor="startTime">
                    {tCommon("start")}
                  </label>
                  <input
                    id="startTime"
                    className={styles.timeInput}
                    name="startTime"
                    type="time"
                    defaultValue={defaultValues.startTime}
                    aria-invalid={state.fieldErrors?.startTime ? true : undefined}
                  />
                </div>
                <div className={styles.timeField}>
                  <label className={styles.timeFieldLabel} htmlFor="endTime">
                    {tCommon("end")}
                  </label>
                  <input
                    id="endTime"
                    className={styles.timeInput}
                    name="endTime"
                    type="time"
                    defaultValue={defaultValues.endTime}
                    aria-invalid={state.fieldErrors?.endTime ? true : undefined}
                  />
                </div>
              </div>
            </section>

            {placeMode === "manual" ? (
              <section className={styles.section} aria-labelledby="activity-place-label">
                <h3 id="activity-place-label" className={styles.sectionLabel}>
                  {t("whereQuestion")}
                </h3>
                <ActivityLocationSection
                  tripId={tripId}
                  defaultValues={defaultValues}
                  placeMode="manual"
                  fieldErrors={state.fieldErrors}
                  onDirtyChange={handleChange}
                />
              </section>
            ) : null}

            {!lockDate ? (
              <div className={styles.typeField}>
                <label className={styles.fieldLabel} htmlFor="date">
                  {t("dayField")}
                </label>
                <select
                  id="date"
                  className={styles.fieldSelect}
                  name="date"
                  defaultValue={defaultValues.date}
                  required
                  aria-invalid={state.fieldErrors?.date ? true : undefined}
                >
                  {tripDates.map((tripDate) => (
                    <option key={tripDate} value={tripDate}>
                      {tripDate}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <details className={styles.detailsSection} open={detailsExpanded}>
              <summary className={styles.detailsSummary}>{t("moreDetails")}</summary>
              <div className={styles.detailsBody}>
                <div className={styles.typeField}>
                  <label className={styles.fieldLabel} htmlFor="type">
                    {t("activityType")}
                  </label>
                  <select
                    id="type"
                    className={styles.fieldSelect}
                    name="type"
                    defaultValue={defaultValues.type}
                    required
                    aria-invalid={state.fieldErrors?.type ? true : undefined}
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(`types.${type as ActivityType}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.notesField}>
                  <label className={styles.fieldLabel} htmlFor="notes">
                    {tCommon("notes")}
                  </label>
                  <textarea
                    id="notes"
                    className={styles.fieldTextarea}
                    name="notes"
                    defaultValue={defaultValues.notes}
                    maxLength={2000}
                    rows={3}
                    dir="auto"
                    aria-invalid={state.fieldErrors?.notes ? true : undefined}
                  />
                </div>
              </div>
            </details>

            {showCostFields && currencies.length > 0 ? (
              <div className={styles.costSection}>
                <EntityCostFields
                  baseCurrency={financeBaseCurrency}
                  currencies={currencies}
                  linkedCost={linkedCost}
                  showCategory
                  showHelper={false}
                  idPrefix={`activity-${activityId ?? "create"}`}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      </QuickAddPinnedFields>

      {showDetails ? (
        <div className={footerClass}>
          <div className={styles.footerActions}>
            <AuthSubmitButton>
              {mode === "create" ? t("createSubmit") : t("updateSubmit")}
            </AuthSubmitButton>
            {onCancel && !overlayNavigation ? (
              <Button
                type="button"
                variant="ghost"
                size="compact"
                className={styles.cancelButton}
                onClick={onCancel}
              >
                {tCommon("cancel")}
              </Button>
            ) : null}
          </div>

          {mode === "edit" && activityId ? (
            <ActivityDeleteControl
              tripId={tripId}
              activityId={activityId}
              onSuccess={onSuccess ? () => onSuccess({ ok: true }) : undefined}
            />
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
