"use client";

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
  googleLabel = "חיפוש מקום",
  manualLabel = "הזנה ידנית",
}: PlaceModeSegmentProps) {
  return (
    <div className={styles.segmentedControl} role="tablist" aria-label="אופן הזנת מקום">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "google"}
        className={styles.segment}
        data-selected={mode === "google" ? "true" : "false"}
        onClick={() => onChange("google")}
      >
        {googleLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "manual"}
        className={styles.segment}
        data-selected={mode === "manual" ? "true" : "false"}
        onClick={() => onChange("manual")}
      >
        {manualLabel}
      </button>
    </div>
  );
}
