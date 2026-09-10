"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { classifyDestinationVisualGroup } from "@/features/destination-visuals/classify-visual-group";
import { getRepresentativeVisualSrcForGroup } from "@/features/destination-visuals/registry";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import { createTripWizardAction, type TripActionState } from "@/features/trips/actions";
import { TabiBrandMark } from "@/features/welcome/TabiBrandMark";
import { DestinationSearchField } from "./DestinationSearchField";
import { POPULAR_DESTINATIONS } from "./popular-destinations";
import { resolveDestinationFromQuery } from "./resolve-destination-client";
import {
  CREATE_TRIP_WIZARD_STEPS,
  createInitialWizardState,
  getWizardStepIndex,
  suggestTripName,
  type CreateTripWizardStep,
} from "./wizard-state";
import styles from "./CreateTripWizard.module.scss";

const STEP_TITLES: Record<CreateTripWizardStep, string> = {
  destination: "Where are you going?",
  dates: "When are you going?",
  details: "Name your trip",
  ready: "You're ready",
};

export function CreateTripWizard() {
  const [state, setState] = useState(createInitialWizardState);
  const [actionState, setActionState] = useState<TripActionState>({});
  const [isPending, startTransition] = useTransition();
  const [popularLoadingId, setPopularLoadingId] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const stepIndex = getWizardStepIndex(state.step);
  const previewVisualSrc = useMemo(() => {
    if (!state.destination) {
      return getRepresentativeVisualSrcForGroup("fallback");
    }
    const group = classifyDestinationVisualGroup(state.destination.countryCode);
    return getRepresentativeVisualSrcForGroup(group);
  }, [state.destination]);

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

  async function selectPopularDestination(preset: (typeof POPULAR_DESTINATIONS)[number]) {
    setPopularLoadingId(preset.id);
    setPopularError(null);
    try {
      const { snapshot, error } = await resolveDestinationFromQuery(preset.label);
      if (snapshot) {
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
        startDate: state.startDate,
        endDate: state.endDate,
      });
      setActionState(result);
    });
  }

  const canContinueDestination = Boolean(state.destination);
  const canContinueDates = Boolean(state.startDate && state.endDate);
  const canContinueDetails = state.name.trim().length >= 2;

  const dateRangeLabel =
    state.startDate && state.endDate
      ? formatCalendarDateRangeDisplay(state.startDate, state.endDate, "en-US")
      : "";

  return (
    <div className={styles.wizard} dir="ltr" lang="en">
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <TabiBrandMark className={styles.headerMark} />
          <span className={styles.headerName}>Tabi</span>
        </div>
        <Link href="/app" className={styles.closeLink}>
          My Trips
        </Link>
      </header>

      <div className={styles.progress} aria-label="Create trip progress">
        {CREATE_TRIP_WIZARD_STEPS.map((step, index) => (
          <span
            key={step}
            className={styles.progressSegment}
            data-active={index <= stepIndex ? "true" : undefined}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className={styles.layout}>
        <aside className={styles.visualPanel} aria-hidden={state.step === "destination" ? undefined : true}>
          <div className={styles.visualFrame}>
            <Image
              src={previewVisualSrc}
              alt=""
              fill
              sizes="(min-width: 1024px) 42vw, 0px"
              className={styles.visualImage}
              priority
            />
            <div className={styles.visualOverlay} />
          </div>
        </aside>

        <main className={styles.main}>
          {stepIndex > 0 ? (
            <button type="button" className={styles.backButton} onClick={goBack}>
              Back
            </button>
          ) : (
            <div className={styles.backSpacer} />
          )}

          <div className={styles.stepContent}>
            <h1 ref={stepHeadingRef} className={styles.stepTitle} tabIndex={-1}>
              {STEP_TITLES[state.step]}
            </h1>

            {state.step === "destination" ? (
              <>
                <div className={styles.mobileVisual} aria-hidden="true">
                  <div className={styles.mobileVisualFrame}>
                    <Image
                      src={previewVisualSrc}
                      alt=""
                      fill
                      sizes="100vw"
                      className={styles.visualImage}
                      priority
                    />
                    <div className={styles.visualOverlay} />
                  </div>
                </div>
                <DestinationSearchField
                  selection={state.destination}
                  onSelectionChange={(destination) =>
                    setState((current) => ({ ...current, destination }))
                  }
                />
                <div className={styles.popularSection}>
                  <p className={styles.popularLabel}>Popular destinations</p>
                  <div className={styles.popularGrid}>
                    {POPULAR_DESTINATIONS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={styles.popularCard}
                        disabled={Boolean(popularLoadingId)}
                        onClick={() => void selectPopularDestination(preset)}
                      >
                        <span className={styles.popularCardImageWrap}>
                          <Image
                            src={preset.imageSrc}
                            alt=""
                            fill
                            sizes="120px"
                            className={styles.popularCardImage}
                          />
                        </span>
                        <span className={styles.popularCardLabel}>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
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
                  Continue
                </button>
              </>
            ) : null}

            {state.step === "dates" ? (
              <>
                <div className={styles.dateFields}>
                  <label className={styles.fieldLabel} htmlFor="startDate">
                    Start date
                  </label>
                  <input
                    id="startDate"
                    className={styles.textInput}
                    type="date"
                    value={state.startDate}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                    required
                  />
                  <label className={styles.fieldLabel} htmlFor="endDate">
                    End date
                  </label>
                  <input
                    id="endDate"
                    className={styles.textInput}
                    type="date"
                    value={state.endDate}
                    min={state.startDate || undefined}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={!canContinueDates}
                  onClick={goNext}
                >
                  Continue
                </button>
              </>
            ) : null}

            {state.step === "details" ? (
              <>
                <label className={styles.fieldLabel} htmlFor="tripName">
                  Trip name
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
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={!canContinueDetails}
                  onClick={goNext}
                >
                  Continue
                </button>
              </>
            ) : null}

            {state.step === "ready" ? (
              <>
                <div className={styles.readyCard}>
                  <div className={styles.readyVisual}>
                    <Image
                      src={previewVisualSrc}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 320px, 100vw"
                      className={styles.visualImage}
                    />
                    <div className={styles.visualOverlay} />
                  </div>
                  <div className={styles.readyBody}>
                    <p className={styles.readyName}>{state.name}</p>
                    <p className={styles.readyMeta}>{state.destination?.displayName}</p>
                    {state.destination?.secondaryLabel ? (
                      <p className={styles.readyMeta}>{state.destination.secondaryLabel}</p>
                    ) : null}
                    <p className={styles.readyMeta}>{dateRangeLabel}</p>
                    <p className={styles.readyNote}>
                      Cover image is representative — your trip&apos;s visual is chosen when
                      you create it.
                    </p>
                  </div>
                </div>
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
                  disabled={isPending}
                  onClick={handleCreateTrip}
                >
                  {isPending ? "Creating trip..." : "Create trip"}
                </button>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
