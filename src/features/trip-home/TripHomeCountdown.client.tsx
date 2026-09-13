"use client";

import { useEffect, useState } from "react";
import {
  calculateCountdownParts,
  type TripCountdownParts,
} from "./resolve-trip-countdown";
import styles from "./TripHomeContent.module.scss";

type TripHomeCountdownProps = {
  targetMs: number;
  referenceMs?: number;
};

const LABELS = {
  days: "ימים",
  hours: "שעות",
  minutes: "דקות",
  seconds: "שניות",
} as const;

function formatCountdownAriaLabel(parts: TripCountdownParts): string {
  return `${parts.days} ימים, ${parts.hours} שעות, ${parts.minutes} דקות ו-${parts.seconds} שניות עד תחילת הטיול`;
}

function resolveNowMs(referenceMs: number | undefined, mountedAt: number): number {
  if (referenceMs !== undefined) {
    return referenceMs + (Date.now() - mountedAt);
  }
  return Date.now();
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

export function TripHomeCountdown({ targetMs, referenceMs }: TripHomeCountdownProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mountedAt] = useState(() => Date.now());
  const [nowMs, setNowMs] = useState(() => resolveNowMs(referenceMs, mountedAt));

  useEffect(() => {
    const updateNow = () => setNowMs(resolveNowMs(referenceMs, mountedAt));

    updateNow();
    if (prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(interval);
  }, [referenceMs, mountedAt, prefersReducedMotion]);

  const parts = calculateCountdownParts(targetMs, nowMs);

  return (
    <div
      className={styles.countdownUnit}
      aria-label={formatCountdownAriaLabel(parts)}
    >
      <div className={styles.countdownGrid}>
        {(Object.keys(LABELS) as Array<keyof typeof LABELS>).map((key) => (
          <div key={key} className={styles.countdownCell}>
            <span className={styles.countdownCellValue}>{parts[key]}</span>
            <span className={styles.countdownCellLabel}>{LABELS[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
