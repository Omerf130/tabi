"use client";

import { useRef, useState, useTransition } from "react";
import {
  formatCalendarDateDisplay,
  formatCalendarDateRangeWithWeekdayDisplay,
} from "@/features/trips/calendar-date";
import { TRIP_DESCRIPTION_MAX_LENGTH } from "@/features/trips/constants";
import { getTripDayCount } from "@/features/trips/trip-days";
import { createTripWizardAction, type TripActionState } from "@/features/trips/actions";
import { DestinationSearchField } from "./DestinationSearchField";
import { PopularDestinationRows } from "./PopularDestinationRows";
import { POPULAR_DESTINATIONS } from "./popular-destinations";
import { resolveDestinationFromQuery } from "./resolve-destination-client";
import { TripDateRangeCalendar } from "./TripDateRangeCalendar";
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

export function CreateTripWizard() {
  const [state, setState] = useState(createInitialWizardState);
  const [actionState, setActionState] = useState<TripActionState>({});
  const [isPending, startTransition] = useTransition();
  const [popularLoadingId, setPopularLoadingId] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [selectedPopularId, setSelectedPopularId] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

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
      setPopularError(error ?? "Could not load this destination");
    } catch {
      setPopularError("Could not load this destination");
    } finally {
      setPopularLoadingId(null);
    }
  }

  function handleCreateTrip() {
    if (!state.destination) {
      return;
    }

    startTransition(async () => {
      const result = await createTripWizardAction({
        googlePlaceId: state.destination!.googlePlaceId,
        name: state.name,
        description: state.description.trim() || undefined,
        startDate: state.startDate,
        endDate: state.endDate,
      });
      setActionState(result);
    });
  }

  const canContinueDestination = Boolean(state.destination);
  const canContinueDates = isValidWizardDateRange(state.startDate, state.endDate);
  const canCreateTrip = state.name.trim().length >= 2 && Boolean(state.destination);

  const durationLabel =
    canContinueDates && state.startDate && state.endDate
      ? (() => {
          const dayCount = getTripDayCount(state.startDate, state.endDate);
          return dayCount === 1 ? "1 day" : `${dayCount} days`;
        })()
      : "";

  const weekdayRangeLabel =
    canContinueDates && state.startDate && state.endDate
      ? formatCalendarDateRangeWithWeekdayDisplay(state.startDate, state.endDate, "en-US")
      : "";

  return (
    <div className={styles.wizard} dir="ltr" lang="en">
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
                  Where are you going?
                </h1>
                <p className={styles.stepSubtitle}>
                  Choose your destination for this trip.
                </p>
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
                Continue →
              </button>
            </>
          ) : null}

          {state.step === "dates" ? (
            <>
              <div className={styles.stepIntro}>
                <h1 ref={stepHeadingRef} className={styles.stepTitle} tabIndex={-1}>
                  When are you traveling?
                </h1>
                <p className={styles.stepSubtitle}>Select your travel dates.</p>
              </div>

              <div className={styles.dateSummaryGrid}>
                <div className={styles.dateSummaryCard}>
                  <span className={styles.dateSummaryLabel}>Start Date</span>
                  <span className={styles.dateSummaryValue}>
                    {state.startDate
                      ? formatCalendarDateDisplay(state.startDate, "en-US")
                      : "Select date"}
                  </span>
                </div>
                <div className={styles.dateSummaryCard}>
                  <span className={styles.dateSummaryLabel}>End Date</span>
                  <span className={styles.dateSummaryValue}>
                    {state.endDate
                      ? formatCalendarDateDisplay(state.endDate, "en-US")
                      : "Select date"}
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
                Continue →
              </button>
              <button type="button" className={styles.secondaryButton} onClick={goBack}>
                Back
              </button>
            </>
          ) : null}

          {state.step === "details" ? (
            <>
              <div className={styles.stepIntro}>
                <h1 ref={stepHeadingRef} className={styles.stepTitle} tabIndex={-1}>
                  Name your trip
                </h1>
                <p className={styles.stepSubtitle}>
                  Give this journey a name you&apos;ll recognize later.
                </p>
              </div>

              <label className={styles.fieldLabel} htmlFor="tripName">
                Trip Name
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
                Trip Description <span className={styles.optionalLabel}>(optional)</span>
              </label>
              <textarea
                id="tripDescription"
                className={styles.textArea}
                value={state.description}
                maxLength={TRIP_DESCRIPTION_MAX_LENGTH}
                rows={4}
                placeholder="Our honeymoon in Japan"
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />

              {state.destination ? (
                <div className={styles.tripSummary}>
                  <p className={styles.tripSummaryTitle}>Trip summary</p>
                  <dl className={styles.tripSummaryList}>
                    <div>
                      <dt>Destination</dt>
                      <dd>{state.destination.displayName}</dd>
                    </div>
                    {canContinueDates ? (
                      <div>
                        <dt>Dates</dt>
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
                {isPending ? "Creating trip..." : "Create Trip →"}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={goBack}>
                Back
              </button>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
