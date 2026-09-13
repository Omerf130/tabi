"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  calculateCountdownParts,
  type TripCountdownParts,
} from "./resolve-trip-countdown";
import styles from "./TripHomeContent.module.scss";

type TripHomeCountdownProps = {
  targetMs: number;
  referenceMs?: number;
};

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
  const t = useTranslations("Home");
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
  const labels = {
    days: t("countdownDays"),
    hours: t("countdownHours"),
    minutes: t("countdownMinutes"),
    seconds: t("countdownSeconds"),
  } as const;

  const ariaLabel = t("countdownAria", {
    days: parts.days,
    hours: parts.hours,
    minutes: parts.minutes,
    seconds: parts.seconds,
  });

  return (
    <div className={styles.countdownUnit} aria-label={ariaLabel}>
      <div className={styles.countdownGrid}>
        {(Object.keys(labels) as Array<keyof TripCountdownParts>).map((key) => (
          <div key={key} className={styles.countdownCell}>
            <span className={styles.countdownCellValue}>{parts[key]}</span>
            <span className={styles.countdownCellLabel}>{labels[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
