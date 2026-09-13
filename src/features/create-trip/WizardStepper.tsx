import {
  CREATE_TRIP_WIZARD_STEPS,
  getWizardStepIndex,
  WIZARD_STEP_LABELS,
  type CreateTripWizardStep,
} from "./wizard-state";
import styles from "./CreateTripWizard.module.scss";

type WizardStepperProps = {
  currentStep: CreateTripWizardStep;
};

export function WizardStepper({ currentStep }: WizardStepperProps) {
  const currentIndex = getWizardStepIndex(currentStep);

  return (
    <nav className={styles.stepper} aria-label="Create trip steps">
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
                <span className={styles.stepperLabel}>{WIZARD_STEP_LABELS[step]}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
