"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import type { CurrencyOption } from "@/features/currency/types";
import { EntityCostFields } from "@/features/finance/EntityCostFields.client";
import {
  ACTIVITY_TYPES,
  createActivityTypeLabelResolver,
  type ActivityType,
} from "./activity-types";
import {
  createActivityAction,
  type ActivityActionState,
} from "./actions";
import {
  ActivityLocationSection,
  type ActivityPlaceMode,
} from "./ActivityLocationSection";
import { PlaceModeSegment } from "./PlaceModeSegment.client";
import { shouldExpandActivityDetails } from "./should-expand-activity-details";
import { translateActivityError } from "./translate-activity-error";
import type { ActivityFormValues } from "./types";
import styles from "./AddItemFlow.module.scss";

const initialState: ActivityActionState = {};

type ActivityAddOverlayProps = {
  tripId: string;
  defaultValues: ActivityFormValues;
  lockDate?: boolean;
  onSuccess?: (result: ActivityActionState) => void;
  onDirtyChange?: (dirty: boolean) => void;
  showCostFields?: boolean;
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
};

export function ActivityAddOverlay({
  tripId,
  defaultValues,
  lockDate = false,
  onSuccess,
  onDirtyChange,
  showCostFields = false,
  financeBaseCurrency = "ILS",
  currencies = [],
}: ActivityAddOverlayProps) {
  const t = useTranslations("Activity");
  const tCommon = useTranslations("Common");
  const resolveTypeLabel = createActivityTypeLabelResolver(t);
  const [state, formAction] = useActionState(createActivityAction, initialState);
  const titleRef = useRef<HTMLInputElement>(null);
  const [placeMode, setPlaceMode] = useState<ActivityPlaceMode>("google");
  const [hasGooglePlace, setHasGooglePlace] = useState(false);
  const detailsExpanded = shouldExpandActivityDetails(defaultValues, "create");
  const showDetails = placeMode === "manual" || hasGooglePlace;
  const errorMessage = translateActivityError(t, state.error);

  useEffect(() => {
    if (state.ok && onSuccess) {
      onSuccess(state);
    }
  }, [state, onSuccess]);

  useEffect(() => {
    if (!showDetails) {
      return;
    }
    titleRef.current?.focus({ preventScroll: true });
  }, [showDetails]);

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

  return (
    <form
      action={formAction}
      className={styles.activityOverlayForm}
      onChange={handleChange}
      onInput={handleChange}
    >
      <input type="hidden" name="tripId" value={tripId} />
      {lockDate ? <input type="hidden" name="date" value={defaultValues.date} /> : null}

      {errorMessage ? (
        <p className={styles.overlayError} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className={styles.activityOverlayStack}>
        <PlaceModeSegment
          mode={placeMode}
          onChange={handlePlaceModeChange}
          googleLabel={t("placeSearchGoogle")}
          manualLabel={t("placeSearchManual")}
        />

        {placeMode === "google" ? (
          <div className={styles.activitySearchBlock}>
            <p className={styles.blockLabel}>{t("whereQuestion")}</p>
            <ActivityLocationSection
              tripId={tripId}
              defaultValues={defaultValues}
              placeMode="google"
              fieldErrors={state.fieldErrors}
              onDirtyChange={handleChange}
              onGoogleSelectionChange={handleGoogleSelectionChange}
              plannerPresentation
            />
          </div>
        ) : null}

        {showDetails ? (
          <>
            <div className={styles.blockField}>
              <label className={styles.blockLabel} htmlFor="activity-title">
                {t("whatQuestion")}
              </label>
              <input
                ref={titleRef}
                id="activity-title"
                className={styles.blockInput}
                name="title"
                defaultValue={defaultValues.title}
                placeholder="TeamLab Planets"
                required
                maxLength={120}
                dir="auto"
                aria-invalid={state.fieldErrors?.title ? true : undefined}
              />
              {state.fieldErrors?.title ? (
                <p className={styles.overlayError} role="alert">
                  {state.fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div className={styles.blockField}>
              <p className={styles.blockLabel}>{t("whenQuestion")}</p>
              <div className={styles.pairRow}>
                <div className={styles.pairCell}>
                  <label className={styles.pairLabel} htmlFor="startTime">
                    {tCommon("start")}
                  </label>
                  <input
                    id="startTime"
                    className={styles.blockInput}
                    name="startTime"
                    type="time"
                    defaultValue={defaultValues.startTime}
                    aria-invalid={state.fieldErrors?.startTime ? true : undefined}
                  />
                </div>
                <div className={styles.pairCell}>
                  <label className={styles.pairLabel} htmlFor="endTime">
                    {tCommon("end")}
                  </label>
                  <input
                    id="endTime"
                    className={styles.blockInput}
                    name="endTime"
                    type="time"
                    defaultValue={defaultValues.endTime}
                    aria-invalid={state.fieldErrors?.endTime ? true : undefined}
                  />
                </div>
              </div>
            </div>

            {placeMode === "manual" ? (
              <div className={styles.blockField}>
                <p className={styles.blockLabel}>{t("whereQuestion")}</p>
                <ActivityLocationSection
                  tripId={tripId}
                  defaultValues={defaultValues}
                  placeMode="manual"
                  fieldErrors={state.fieldErrors}
                  onDirtyChange={handleChange}
                  plannerPresentation
                />
              </div>
            ) : null}

            <details className={styles.compactDetails} open={detailsExpanded}>
              <summary className={styles.compactDetailsSummary}>{t("moreDetails")}</summary>
              <div className={styles.compactDetailsBody}>
                <div className={styles.blockField}>
                  <label className={styles.pairLabel} htmlFor="type">
                    {t("activityType")}
                  </label>
                  <select
                    id="type"
                    className={styles.blockInput}
                    name="type"
                    defaultValue={defaultValues.type}
                    required
                    aria-invalid={state.fieldErrors?.type ? true : undefined}
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {resolveTypeLabel(type as ActivityType)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.blockField}>
                  <label className={styles.pairLabel} htmlFor="notes">
                    {tCommon("notes")}
                  </label>
                  <textarea
                    id="notes"
                    className={styles.blockTextarea}
                    name="notes"
                    defaultValue={defaultValues.notes}
                    maxLength={2000}
                    rows={2}
                    dir="auto"
                    aria-invalid={state.fieldErrors?.notes ? true : undefined}
                  />
                </div>
              </div>
            </details>

            {showCostFields && currencies.length > 0 ? (
              <div className={styles.blockField}>
                <EntityCostFields
                  baseCurrency={financeBaseCurrency}
                  currencies={currencies}
                  showCategory
                  showHelper={false}
                  idPrefix="activity-create"
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {showDetails ? (
        <div className={styles.overlayFooter}>
          <AuthSubmitButton>{t("createSubmit")}</AuthSubmitButton>
        </div>
      ) : null}
    </form>
  );
}
