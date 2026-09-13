"use client";

import { useTranslations } from "next-intl";
import {
  CREATE_TRIP_WIZARD_STEPS,
  getWizardStepIndex,
  type CreateTripWizardStep,
} from "./wizard-state";
import styles from "./CreateTripWizard.module.scss";

type WizardStepperProps = {
  currentStep: CreateTripWizardStep;
};

export function WizardStepper({ currentStep }: WizardStepperProps) {
  const t = useTranslations("CreateTrip.steps");
  const currentIndex = getWizardStepIndex(currentStep);

  return (
    <nav className={styles.stepper} aria-label={t("ariaLabel")}>
      <ol className={styles.stepperList}>
        {CREATE_TRIP_WIZARD_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const markerContent = isComplete ? "✓" : String(index + 1);

          return (
            <li
              key={step}
              className={styles.stepperItem}
              aria-current={isCurrent ? "step" : undefined}
            >
              {index > 0 ? (
                <span
                  className={styles.stepperLine}
                  data-complete={isComplete || isCurrent ? "true" : undefined}
                  aria-hidden="true"
                />
              ) : null}
              <div className={styles.stepperMarkerWrap}>
                <span
                  className={styles.stepperMarker}
                  data-state={
                    isComplete ? "complete" : isCurrent ? "current" : "upcoming"
                  }
                >
                  {markerContent}
                </span>
                <span className={styles.stepperLabel}>{t(step)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
