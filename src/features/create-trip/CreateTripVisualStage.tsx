"use client";

import { IconCheck, IconPlane } from "@/components/ui/icons";
import { CreateTripProgressStepIcon } from "./create-trip-progress-step-icons";
import styles from "./CreateTripVisualStage.module.scss";

type CreateTripVisualStageProps = {
  variant: "progress" | "ready";
  stepIndex: number;
  atmosphereSrc: string;
};

export function CreateTripVisualStage({
  variant,
  stepIndex,
  atmosphereSrc,
}: CreateTripVisualStageProps) {
  return (
    <div
      className={styles.stage}
      data-variant={variant}
      data-visual-step={variant === "ready" ? "ready" : String(stepIndex + 1)}
      aria-hidden={variant === "progress" ? true : undefined}
    >
      <div className={styles.glowOuter} aria-hidden="true" />
      <div className={styles.glowInner} aria-hidden="true" />
      <div className={styles.glowWarm} aria-hidden="true" />

      <img
        key={atmosphereSrc}
        className={styles.atmosphere}
        src={atmosphereSrc}
        alt=""
        decoding="async"
        draggable={false}
      />

      <div className={styles.core}>
        {variant === "ready" ? (
          <div className={styles.readyIconStack}>
            <IconPlane className={styles.readyPlaneIcon} aria-hidden="true" />
            <IconCheck className={styles.readyCheckIcon} aria-hidden="true" />
          </div>
        ) : (
          <CreateTripProgressStepIcon
            key={stepIndex}
            stepIndex={stepIndex}
            className={styles.stepIcon}
          />
        )}
      </div>
    </div>
  );
}
