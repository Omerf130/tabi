"use client";

import { useMemo, useState } from "react";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import {
  buildCalendarMonthGrid,
  getInitialVisibleMonth,
  shiftCalendarMonth,
} from "./build-calendar-month";
import {
  getCalendarDayVisualState,
  selectTripDateRange,
} from "./trip-date-range-selection";
import styles from "./CreateTripWizard.module.scss";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type TripDateRangeCalendarProps = {
  startDate: string;
  endDate: string;
  onRangeChange: (next: { startDate: string; endDate: string }) => void;
};

export function TripDateRangeCalendar({
  startDate,
  endDate,
  onRangeChange,
}: TripDateRangeCalendarProps) {
  const todayJapan = getJapanCalendarDate();
  const initialMonth = getInitialVisibleMonth(startDate, endDate);
  const [visibleYear, setVisibleYear] = useState(initialMonth.year);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth.month);

  const monthGrid = useMemo(
    () => buildCalendarMonthGrid(visibleYear, visibleMonth),
    [visibleYear, visibleMonth],
  );

  const monthTitle = useMemo(() => {
    const anchor = new Date(Date.UTC(visibleYear, visibleMonth - 1, 1));
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "long",
      year: "numeric",
    }).format(anchor);
  }, [visibleYear, visibleMonth]);

  function shiftMonth(delta: -1 | 1) {
    const next = shiftCalendarMonth(visibleYear, visibleMonth, delta);
    setVisibleYear(next.year);
    setVisibleMonth(next.month);
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button
          type="button"
          className={styles.calendarNavButton}
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className={styles.calendarTitle}>{monthTitle}</p>
        <button
          type="button"
          className={styles.calendarNavButton}
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className={styles.calendarWeekdays} aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className={styles.calendarWeekday}>
            {label}
          </span>
        ))}
      </div>

      <div className={styles.calendarGrid} role="grid" aria-label={monthTitle}>
        {monthGrid.weeks.flatMap((week, weekIndex) =>
          week.map((cell, dayIndex) => {
            if (!cell) {
              return (
                <span
                  key={`empty-${weekIndex}-${dayIndex}`}
                  className={styles.calendarEmptyCell}
                  role="presentation"
                />
              );
            }

            const visualState = getCalendarDayVisualState(
              cell.date,
              startDate,
              endDate,
              todayJapan,
            );
            const selectedLabel =
              cell.date === startDate
                ? "start date"
                : cell.date === endDate
                  ? "end date"
                  : undefined;

            return (
              <button
                key={cell.date}
                type="button"
                className={styles.calendarDayButton}
                data-state={visualState}
                aria-label={
                  selectedLabel
                    ? `${cell.day}, ${selectedLabel}`
                    : `Select ${cell.day}`
                }
                aria-pressed={visualState.startsWith("range")}
                onClick={() =>
                  onRangeChange(
                    selectTripDateRange({ startDate, endDate }, cell.date),
                  )
                }
              >
                <span className={styles.calendarDayLabel}>{cell.day}</span>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
