"use client";

import { useTranslations } from "next-intl";
import styles from "./AddItemFlow.module.scss";

type PlaceMode = "google" | "manual";

type PlaceModeSegmentProps = {
  mode: PlaceMode;
  onChange: (mode: PlaceMode) => void;
  googleLabel?: string;
  manualLabel?: string;
};

export function PlaceModeSegment({
  mode,
  onChange,
  googleLabel,
  manualLabel,
}: PlaceModeSegmentProps) {
  const t = useTranslations("Activity");
  const resolvedGoogleLabel = googleLabel ?? t("placeSearchGoogle");
  const resolvedManualLabel = manualLabel ?? t("placeSearchManual");

  return (
    <div
      className={styles.segmentedControl}
      role="tablist"
      aria-label={t("placeSearchModeAria")}
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "google"}
        className={styles.segment}
        data-selected={mode === "google" ? "true" : "false"}
        onClick={() => onChange("google")}
      >
        {resolvedGoogleLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "manual"}
        className={styles.segment}
        data-selected={mode === "manual" ? "true" : "false"}
        onClick={() => onChange("manual")}
      >
        {resolvedManualLabel}
      </button>
    </div>
  );
}
