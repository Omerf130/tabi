"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconCalendar,
  IconCheck,
  IconChevron,
  IconGrid,
  IconMembers,
} from "@/components/ui/icons";
import { TabiLogo } from "@/features/brand/TabiLogo";
import {
  CREATE_TRIP_PROGRESS_ALL_ASSETS,
  CREATE_TRIP_READY_ASSET,
  getCreateTripProgressAssetForStep,
} from "./create-trip-progress-assets";
import { resolveCreateTripReadyTripLabel } from "./create-trip-ready-label";
import {
  CREATE_TRIP_PROGRESS_STEP_COUNT,
  canShowCreateTripReady,
  getCreateTripProgressStepIndex,
} from "./create-trip-progress-timing";
import { CreateTripVisualStage } from "./CreateTripVisualStage";
import styles from "./CreateTripProgressExperience.module.scss";

const PROGRESS_STEP_KEYS = ["1", "2", "3", "4", "5"] as const;

const READY_BENEFIT_KEYS = ["planDays", "toolsReady", "share"] as const;

const READY_BENEFIT_ICONS = {
  planDays: IconCalendar,
  toolsReady: IconGrid,
  share: IconMembers,
} as const;

export type CreateTripProgressMode = "progress" | "ready" | "failed";

type CreateTripProgressExperienceProps = {
  mode: CreateTripProgressMode;
  progressStartedAtMs: number;
  tripId: string | null;
  tripName: string;
  tripNameTouched?: boolean;
  destinationDisplayName?: string;
  errorMessage?: string;
  onBecomeReady: () => void;
  onEnterTrip: () => void;
  onBackToDetails: () => void;
};

function preloadCreateTripProgressAssets(): void {
  for (const src of CREATE_TRIP_PROGRESS_ALL_ASSETS) {
    const img = new Image();
    img.src = src;
  }
}

function BrandHeader() {
  return (
    <header className={styles.brandHeader}>
      <TabiLogo variant="auth" />
    </header>
  );
}

function ProgressStepper({
  stepIndex,
  ariaLabel,
  stepLabel,
}: {
  stepIndex: number;
  ariaLabel: string;
  stepLabel: (key: (typeof PROGRESS_STEP_KEYS)[number]) => string;
}) {
  return (
    <div className={styles.stepperShell}>
      <ol className={styles.stepper} aria-label={ariaLabel}>
        {PROGRESS_STEP_KEYS.map((key, index) => {
          const rowState =
            index < stepIndex
              ? "complete"
              : index === stepIndex
                ? "active"
                : "upcoming";
          const connectorComplete = index < stepIndex;
          const isLast = index === PROGRESS_STEP_KEYS.length - 1;

          return (
            <li
              key={key}
              className={styles.stepperRow}
              aria-current={rowState === "active" ? "step" : undefined}
            >
              <div className={styles.stepperTrack}>
                {!isLast ? (
                  <span
                    className={styles.stepConnector}
                    data-complete={connectorComplete ? "true" : undefined}
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={styles.stepMarker}
                  data-state={rowState === "upcoming" ? undefined : rowState}
                >
                  {rowState === "active" ? (
                    <>
                      <span className={styles.stepMarkerHalo} aria-hidden="true" />
                      <span className={styles.stepMarkerRing} aria-hidden="true" />
                    </>
                  ) : null}
                  <span className={styles.stepMarkerCore}>
                    {rowState === "complete" ? (
                      <span className={styles.stepCheck} aria-hidden="true">
                        ✓
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>
                </span>
              </div>
              <span
                className={styles.stepLabel}
                data-state={rowState === "upcoming" ? undefined : rowState}
              >
                {stepLabel(key)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function CreateTripProgressExperience({
  mode,
  progressStartedAtMs,
  tripId,
  tripName,
  destinationDisplayName,
  errorMessage,
  onBecomeReady,
  onEnterTrip,
  onBackToDetails,
}: CreateTripProgressExperienceProps) {
  const tProgress = useTranslations("CreateTrip.progress");
  const tReady = useTranslations("CreateTrip.ready");
  const tFailed = useTranslations("CreateTrip.failed");
  const liveRegionId = useId();
  const readyAnnouncedRef = useRef(false);
  const becomeReadyCalledRef = useRef(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    preloadCreateTripProgressAssets();
  }, []);

  useEffect(() => {
    if (mode !== "progress") {
      return;
    }

    const tick = () => {
      setElapsedMs(Date.now() - progressStartedAtMs);
    };

    tick();
    const intervalId = window.setInterval(tick, 50);
    return () => window.clearInterval(intervalId);
  }, [mode, progressStartedAtMs]);

  const stepIndex =
    mode === "ready"
      ? CREATE_TRIP_PROGRESS_STEP_COUNT - 1
      : getCreateTripProgressStepIndex(elapsedMs);

  const activeStepKey = PROGRESS_STEP_KEYS[stepIndex] ?? "1";
  const atmosphereSrc =
    mode === "ready"
      ? CREATE_TRIP_READY_ASSET
      : getCreateTripProgressAssetForStep(stepIndex);

  useEffect(() => {
    if (mode !== "progress") {
      return;
    }
    if (
      canShowCreateTripReady({ elapsedMs, tripId }) &&
      !becomeReadyCalledRef.current
    ) {
      becomeReadyCalledRef.current = true;
      onBecomeReady();
    }
  }, [elapsedMs, tripId, mode, onBecomeReady]);

  useEffect(() => {
    if (mode === "ready" && !readyAnnouncedRef.current) {
      readyAnnouncedRef.current = true;
      ctaRef.current?.focus({ preventScroll: true });
    }
  }, [mode]);

  const readyTripLabel = resolveCreateTripReadyTripLabel({
    tripName,
    destinationDisplayName,
  });

  const heroTitle =
    mode === "ready"
      ? tReady("heading", { tripLabel: readyTripLabel })
      : tProgress(`steps.${activeStepKey}.title`);

  const heroSubtitle =
    mode === "ready"
      ? tReady("supporting")
      : tProgress(`steps.${activeStepKey}.subtitle`);

  if (mode === "failed") {
    return (
      <div className={styles.screen} data-phase="failed" data-visual-step="1">
        <div className={styles.backdrop} aria-hidden="true">
          <div className={styles.backdropBloom} />
        </div>
        <div className={styles.viewport}>
          <div className={styles.column}>
            <BrandHeader />
            <div className={styles.errorPanel}>
              <p className={styles.eyebrow}>{tFailed("eyebrow")}</p>
              <h1 className={styles.errorTitle}>{tFailed("title")}</h1>
              <p className={styles.errorMessage}>
                {errorMessage ?? tFailed("message")}
              </p>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={onBackToDetails}
              >
                {tFailed("backToDetails")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "ready") {
    return (
      <div className={styles.screen} data-phase="ready" data-visual-step="ready">
        <div className={styles.backdrop} aria-hidden="true">
          <div className={styles.backdropBloom} />
        </div>
        <div className={styles.viewport}>
          <div className={styles.column}>
            <BrandHeader />

            <div className={styles.successBadge}>
              <IconCheck className={styles.successBadgeIcon} />
              <span>{tReady("badge")}</span>
            </div>

            <div
              className={styles.introBlock}
              aria-live="polite"
              aria-atomic="true"
              id={liveRegionId}
            >
              <h1 className={`${styles.heroTitle} ${styles.heroCopyEnter}`}>
                {heroTitle}
              </h1>
              <p className={`${styles.heroSubtitle} ${styles.heroCopyEnter}`}>
                {heroSubtitle}
              </p>
            </div>

            <CreateTripVisualStage
              variant="ready"
              stepIndex={stepIndex}
              atmosphereSrc={atmosphereSrc}
            />

            <ul className={styles.readyBenefits}>
              {READY_BENEFIT_KEYS.map((key) => {
                const BenefitIcon = READY_BENEFIT_ICONS[key];
                return (
                  <li
                    key={key}
                    className={styles.readyBenefitItem}
                    data-benefit={key}
                  >
                    <span className={styles.readyBenefitIconWrap}>
                      <BenefitIcon className={styles.readyBenefitIcon} />
                    </span>
                    <span className={styles.readyBenefitLabel}>
                      {tReady(`benefits.${key}`)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className={styles.ctaBlock}>
              <button
                ref={ctaRef}
                type="button"
                className={styles.primaryButton}
                onClick={onEnterTrip}
              >
                <span>{tReady("cta")}</span>
                <IconChevron className={styles.primaryButtonChevron} />
              </button>
              <p className={styles.footerNote}>{tReady("footerNote")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.screen}
      data-phase="progress"
      data-visual-step={String(stepIndex + 1)}
    >
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropBloom} />
      </div>
      <div className={styles.viewport}>
        <div className={styles.column}>
          <BrandHeader />

          <div className={styles.introBlock}>
            <p className={styles.eyebrow}>{tProgress("eyebrow")}</p>
            <div
              aria-live="polite"
              aria-atomic="true"
              id={liveRegionId}
              className={styles.introCopy}
            >
              <h1
                className={`${styles.heroTitle} ${styles.heroCopyEnter}`}
                key={activeStepKey}
              >
                {heroTitle}
              </h1>
              <p
                className={`${styles.heroSubtitle} ${styles.heroCopyEnter}`}
                key={`${activeStepKey}-sub`}
              >
                {heroSubtitle}
              </p>
            </div>
          </div>

          <CreateTripVisualStage
            variant="progress"
            stepIndex={stepIndex}
            atmosphereSrc={atmosphereSrc}
          />

          <ProgressStepper
            stepIndex={stepIndex}
            ariaLabel={tProgress("stepperAriaLabel")}
            stepLabel={(key) => tProgress(`steps.${key}.label`)}
          />
        </div>
      </div>
    </div>
  );
}
