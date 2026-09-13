"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatAppDate } from "@/features/i18n/formatting";
import { localeToIntlLocale, resolveAppLocale } from "@/features/i18n/locale";
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
  const locale = resolveAppLocale(useLocale());
  const intlLocale = localeToIntlLocale(locale);
  const t = useTranslations("CreateTrip.dates");
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
    return formatAppDate(anchor, locale, {
      timeZone: "UTC",
      month: "long",
      year: "numeric",
    });
  }, [visibleYear, visibleMonth, locale]);

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, {
      weekday: "short",
      timeZone: "UTC",
    });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.UTC(2024, 0, 7 + index));
      return formatter.format(date);
    });
  }, [intlLocale]);

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
          aria-label={t("previousMonth")}
        >
          ‹
        </button>
        <p className={styles.calendarTitle}>{monthTitle}</p>
        <button
          type="button"
          className={styles.calendarNavButton}
          onClick={() => shiftMonth(1)}
          aria-label={t("nextMonth")}
        >
          ›
        </button>
      </div>

      <div className={styles.calendarWeekdays} aria-hidden="true">
        {weekdayLabels.map((label) => (
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
                ? t("startDateSelected", { day: cell.day })
                : cell.date === endDate
                  ? t("endDateSelected", { day: cell.day })
                  : t("selectDay", { day: cell.day });

            return (
              <button
                key={cell.date}
                type="button"
                className={styles.calendarDayButton}
                data-state={visualState}
                aria-label={selectedLabel}
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
