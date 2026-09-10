"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { IconChevron } from "@/components/ui/icons";
import type { ItineraryDayStripItem } from "./types";
import styles from "./ItineraryExperience.module.scss";

type ItineraryDayStripProps = {
  days: readonly ItineraryDayStripItem[];
};

export function ItineraryDayStrip({ days }: ItineraryDayStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [days]);

  const scrollBy = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({
      left: direction * scrollerRef.current.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  return (
    <nav className={styles.dayStripNav} aria-label="ימי הטיול">
      <button
        type="button"
        className={styles.dayStripScrollButton}
        onClick={() => scrollBy(-1)}
        aria-label="גלילה לימים קודמים"
      >
        <IconChevron className={styles.dayStripScrollPrev} aria-hidden />
      </button>

      <div ref={scrollerRef} className={styles.dayStripScroller}>
        <ul className={styles.dayStripList}>
          {days.map((day) => (
            <li key={day.date} className={styles.dayStripItem}>
              <Link
                ref={day.isSelected ? selectedRef : undefined}
                href={day.href}
                className={styles.dayStripLink}
                data-selected={day.isSelected ? "true" : "false"}
                aria-current={day.isSelected ? "date" : undefined}
              >
                <span className={styles.dayStripNumber}>יום {day.dayNumber}</span>
                <span className={styles.dayStripDate}>{day.shortDateLabel}</span>
                {day.isToday ? (
                  <span className={styles.dayStripToday}>היום</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className={styles.dayStripScrollButton}
        onClick={() => scrollBy(1)}
        aria-label="גלילה לימים הבאים"
      >
        <IconChevron className={styles.dayStripScrollNext} aria-hidden />
      </button>
    </nav>
  );
}
