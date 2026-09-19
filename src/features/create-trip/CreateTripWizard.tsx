"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { formatAppDate, formatAppNumber } from "@/features/i18n/formatting";
import { resolveAppLocale } from "@/features/i18n/locale";
import { TRIP_DESCRIPTION_MAX_LENGTH } from "@/features/trips/constants";
import { parseCalendarDateParts } from "@/features/trips/calendar-date";
import { getTripDayCount } from "@/features/trips/trip-days";
import { createTripWizardAction, type TripActionState } from "@/features/trips/actions";
import { DestinationSearchField } from "./DestinationSearchField";
import { PopularDestinationRows } from "./PopularDestinationRows";
import { POPULAR_DESTINATIONS } from "./popular-destinations";
import { resolveDestinationFromQuery } from "./resolve-destination-client";
import { TripDateRangeCalendar } from "./TripDateRangeCalendar";
import { CreateTripProgressExperience } from "./CreateTripProgressExperience";
import { isCreateTripWizardSuccess } from "./create-trip-wizard-result";
import { WizardHero } from "./WizardHero";
import {
  CREATE_TRIP_WIZARD_STEPS,
  createInitialWizardState,
  getWizardStepIndex,
  isValidWizardDateRange,
  suggestTripName,
  type CreateTripWizardStep,
} from "./wizard-state";
import styles from "./CreateTripWizard.module.scss";

export type CreateTripUiPhase = "wizard" | "progress" | "ready" | "failed";

function calendarDateToUtcDate(value: string): Date {
  const parts = parseCalendarDateParts(value);
  if (!parts) {
    return new Date(value);
  }
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatCalendarDate(value: string, locale: ReturnType<typeof resolveAppLocale>): string {
  return formatAppDate(calendarDateToUtcDate(value), locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCalendarDateWithWeekday(
  value: string,
  locale: ReturnType<typeof resolveAppLocale>,
): string {
  return formatAppDate(calendarDateToUtcDate(value), locale, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CreateTripWizard() {
  const router = useRouter();
  const locale = resolveAppLocale(useLocale());
  const tDestination = useTranslations("CreateTrip.destination");
  const tDates = useTranslations("CreateTrip.dates");
  const tDetails = useTranslations("CreateTrip.details");
  const tErrors = useTranslations("CreateTrip.errors");
  const tFailed = useTranslations("CreateTrip.failed");
  const tTripsErrors = useTranslations("Trips.errors");
  const [state, setState] = useState(createInitialWizardState);
  const [actionState, setActionState] = useState<TripActionState>({});
  const [uiPhase, setUiPhase] = useState<CreateTripUiPhase>("wizard");
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [progressStartedAtMs, setProgressStartedAtMs] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [popularLoadingId, setPopularLoadingId] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [selectedPopularId, setSelectedPopularId] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const creationStartedRef = useRef(false);

  const stepIndex = getWizardStepIndex(state.step);

  function focusStepHeading() {
    queueMicrotask(() => stepHeadingRef.current?.focus());
  }

  function goToStep(step: CreateTripWizardStep) {
    setState((current) => ({ ...current, step }));
    focusStepHeading();
  }

  function goBack() {
    const previous = CREATE_TRIP_WIZARD_STEPS[stepIndex - 1];
    if (previous) {
      goToStep(previous);
    }
  }

  function goNext() {
    const next = CREATE_TRIP_WIZARD_STEPS[stepIndex + 1];
    if (!next) {
      return;
    }

    if (next === "details" && state.destination && !state.nameTouched) {
      setState((current) => ({
        ...current,
        step: next,
        name: suggestTripName(current.destination!, current.startDate),
      }));
    } else {
      setState((current) => ({ ...current, step: next }));
    }
    focusStepHeading();
  }

  async function selectPopularDestination(
    preset: (typeof POPULAR_DESTINATIONS)[number],
  ) {
    setPopularLoadingId(preset.id);
    setPopularError(null);
    try {
      const { snapshot, error } = await resolveDestinationFromQuery(preset.label);
      if (snapshot) {
        setSelectedPopularId(preset.id);
        setState((current) => ({
          ...current,
          destination: snapshot,
        }));
        setActionState({});
        return;
      }
      setPopularError(error ?? tErrors("destinationLoadFailed"));
    } catch {
      setPopularError(tErrors("destinationLoadFailed"));
    } finally {
      setPopularLoadingId(null);
    }
  }

  const resolveActionErrorMessage = useCallback(
    (result: TripActionState) => {
      if (result.error === "generic") {
        return tTripsErrors("generic");
      }
      if (result.fieldErrors) {
        const first = Object.values(result.fieldErrors).find(Boolean);
        if (first === "name") {
          return tTripsErrors("name");
        }
        if (first === "startDate" || first === "endDate" || first === "dateOrder") {
          return tTripsErrors("startDate");
        }
      }
      return tFailed("message");
    },
    [tFailed, tTripsErrors],
  );

  function handleCreateTrip() {
    if (!state.destination || creationStartedRef.current) {
      return;
    }

    creationStartedRef.current = true;
    setCreatedTripId(null);
    setProgressStartedAtMs(Date.now());
    setUiPhase("progress");
    setActionState({});

    startTransition(async () => {
      const result = await createTripWizardAction({
        googlePlaceId: state.destination!.googlePlaceId,
        name: state.name,
        description: state.description.trim() || undefined,
        startDate: state.startDate,
        endDate: state.endDate,
      });

      if (isCreateTripWizardSuccess(result)) {
        setCreatedTripId(result.tripId);
        return;
      }

      setActionState(result);
      creationStartedRef.current = false;
      setUiPhase("failed");
    });
  }

  const handleEnterTrip = useCallback(() => {
    if (!createdTripId) {
      return;
    }
    router.push(`/app/trips/${createdTripId}`);
  }, [createdTripId, router]);

  const handleBackToDetailsFromFailure = useCallback(() => {
    creationStartedRef.current = false;
    setCreatedTripId(null);
    setUiPhase("wizard");
    setState((current) => ({ ...current, step: "details" }));
    focusStepHeading();
  }, []);

  const handleBecomeReady = useCallback(() => {
    setUiPhase("ready");
  }, []);

  if (uiPhase === "progress" || uiPhase === "ready") {
    return (
      <CreateTripProgressExperience
        mode={uiPhase}
        progressStartedAtMs={progressStartedAtMs}
        tripId={createdTripId}
        tripName={state.name}
        tripNameTouched={state.nameTouched}
        destinationDisplayName={state.destination?.displayName}
        onBecomeReady={handleBecomeReady}
        onEnterTrip={handleEnterTrip}
        onBackToDetails={handleBackToDetailsFromFailure}
      />
    );
  }

  if (uiPhase === "failed") {
    return (
      <CreateTripProgressExperience
        mode="failed"
        progressStartedAtMs={progressStartedAtMs}
        tripId={null}
        tripName={state.name}
        tripNameTouched={state.nameTouched}
        destinationDisplayName={state.destination?.displayName}
        errorMessage={resolveActionErrorMessage(actionState)}
        onBecomeReady={handleBecomeReady}
        onEnterTrip={handleEnterTrip}
        onBackToDetails={handleBackToDetailsFromFailure}
      />
    );
  }

  const canContinueDestination = Boolean(state.destination);
  const canContinueDates = isValidWizardDateRange(state.startDate, state.endDate);
  const canCreateTrip = state.name.trim().length >= 2 && Boolean(state.destination);

  const durationLabel =
    canContinueDates && state.startDate && state.endDate
      ? (() => {
          const dayCount = getTripDayCount(state.startDate, state.endDate);
          return dayCount === 1
            ? tDates("durationOneDay")
            : tDates("durationManyDays", {
                count: formatAppNumber(dayCount, locale),
              });
        })()
      : "";

  const weekdayRangeLabel =
    canContinueDates && state.startDate && state.endDate
      ? (() => {
          const start = formatCalendarDateWithWeekday(state.startDate, locale);
          const end = formatCalendarDateWithWeekday(state.endDate, locale);
          return state.startDate === state.endDate ? start : `${start} – ${end}`;
        })()
      : "";

  return (
    <div className={styles.wizard}>
      <WizardHero
        step={state.step}
        canGoBack={stepIndex > 0}
        onBack={goBack}
      />

      <main className={styles.workspace}>
        <div className={styles.stepContent}>
          {state.step === "destination" ? (
            <>
              <div className={styles.stepIntro}>
                <h1 ref={stepHeadingRef} className={styles.stepTitle} tabIndex={-1}>
                  {tDestination("title")}
                </h1>
                <p className={styles.stepSubtitle}>{tDestination("subtitle")}</p>
              </div>

              <DestinationSearchField
                selection={state.destination}
                onSelectionChange={(destination) => {
                  setSelectedPopularId(null);
                  setState((current) => ({ ...current, destination }));
                }}
              />

              <PopularDestinationRows
                loadingId={popularLoadingId}
                selectedDestinationId={selectedPopularId}
                onSelect={(preset) => void selectPopularDestination(preset)}
              />

              {popularError ? (
                <p className={styles.fieldError} role="alert">
                  {popularError}
                </p>
              ) : null}

              <button
                type="button"
                className={styles.primaryButton}
                disabled={!canContinueDestination}
                onClick={goNext}
              >
                {tDestination("continue")}
              </button>
            </>
          ) : null}

          {state.step === "dates" ? (
            <>
              <div className={styles.stepIntro}>
                <h1 ref={stepHeadingRef} className={styles.stepTitle} tabIndex={-1}>
                  {tDates("title")}
                </h1>
                <p className={styles.stepSubtitle}>{tDates("subtitle")}</p>
              </div>

              <div className={styles.dateSummaryGrid}>
                <div className={styles.dateSummaryCard}>
                  <span className={styles.dateSummaryLabel}>{tDates("startDate")}</span>
                  <span className={styles.dateSummaryValue}>
                    {state.startDate
                      ? formatCalendarDate(state.startDate, locale)
                      : tDates("selectDate")}
                  </span>
                </div>
                <div className={styles.dateSummaryCard}>
                  <span className={styles.dateSummaryLabel}>{tDates("endDate")}</span>
                  <span className={styles.dateSummaryValue}>
                    {state.endDate
                      ? formatCalendarDate(state.endDate, locale)
                      : tDates("selectDate")}
                  </span>
                </div>
              </div>

              {canContinueDates ? (
                <div className={styles.durationSummary} aria-live="polite">
                  <span className={styles.durationIcon} aria-hidden="true">
                    📅
                  </span>
                  <div className={styles.durationCopy}>
                    <strong>{durationLabel}</strong>
                    <span>{weekdayRangeLabel}</span>
                  </div>
                </div>
              ) : null}

              <TripDateRangeCalendar
                startDate={state.startDate}
                endDate={state.endDate}
                onRangeChange={({ startDate, endDate }) =>
                  setState((current) => ({ ...current, startDate, endDate }))
                }
              />

              <button
                type="button"
                className={styles.primaryButton}
                disabled={!canContinueDates}
                onClick={goNext}
              >
                {tDates("continue")}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={goBack}>
                {tDates("back")}
              </button>
            </>
          ) : null}

          {state.step === "details" ? (
            <>
              <div className={styles.stepIntro}>
                <h1 ref={stepHeadingRef} className={styles.stepTitle} tabIndex={-1}>
                  {tDetails("title")}
                </h1>
                <p className={styles.stepSubtitle}>{tDetails("subtitle")}</p>
              </div>

              <label className={styles.fieldLabel} htmlFor="tripName">
                {tDetails("tripName")}
              </label>
              <input
                id="tripName"
                className={styles.textInput}
                type="text"
                value={state.name}
                minLength={2}
                maxLength={80}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    name: event.target.value,
                    nameTouched: true,
                  }))
                }
                required
              />

              <label className={styles.fieldLabel} htmlFor="tripDescription">
                {tDetails("tripDescription")}{" "}
                <span className={styles.optionalLabel}>{tDetails("optional")}</span>
              </label>
              <textarea
                id="tripDescription"
                className={styles.textArea}
                value={state.description}
                maxLength={TRIP_DESCRIPTION_MAX_LENGTH}
                rows={4}
                placeholder={tDetails("descriptionPlaceholder")}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />

              {state.destination ? (
                <div className={styles.tripSummary}>
                  <p className={styles.tripSummaryTitle}>{tDetails("summaryTitle")}</p>
                  <dl className={styles.tripSummaryList}>
                    <div>
                      <dt>{tDetails("summaryDestination")}</dt>
                      <dd>{state.destination.displayName}</dd>
                    </div>
                    {canContinueDates ? (
                      <div>
                        <dt>{tDetails("summaryDates")}</dt>
                        <dd>
                          {weekdayRangeLabel}
                          {durationLabel ? ` · ${durationLabel}` : ""}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ) : null}

              {actionState.error ? (
                <p className={styles.fieldError} role="alert">
                  {actionState.error}
                </p>
              ) : null}
              {actionState.fieldErrors ? (
                <p className={styles.fieldError} role="alert">
                  {Object.values(actionState.fieldErrors).find(Boolean)}
                </p>
              ) : null}

              <button
                type="button"
                className={styles.primaryButton}
                disabled={!canCreateTrip || isPending}
                onClick={handleCreateTrip}
              >
                {isPending ? tDetails("creating") : tDetails("create")}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={goBack}>
                {tDetails("back")}
              </button>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
