"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { formatAppDate, formatAppNumber } from "@/features/i18n/formatting";
import { resolveAppLocale } from "@/features/i18n/locale";
import { parseCalendarDateParts } from "@/features/trips/calendar-date";
import { getTripDayCount } from "@/features/trips/trip-days";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type TripCollectionCardProps = {
  trip: MyTripsCardItem;
};

function calendarDateToUtcDate(value: string): Date {
  const parts = parseCalendarDateParts(value);
  if (!parts) {
    return new Date(value);
  }
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatCalendarDate(value: string, locale: ReturnType<typeof resolveAppLocale>): string {
  return formatAppDate(calendarDateToUtcDate(value), locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function TripCollectionCard({ trip }: TripCollectionCardProps) {
  const locale = resolveAppLocale(useLocale());
  const t = useTranslations("MyTrips");
  const startFormatted = formatCalendarDate(trip.startDate, locale);
  const endFormatted = formatCalendarDate(trip.endDate, locale);
  const dateRange =
    trip.startDate === trip.endDate
      ? startFormatted
      : `${startFormatted} – ${endFormatted}`;

  const dayCount = getTripDayCount(trip.startDate, trip.endDate);
  const durationLabel =
    dayCount === 1
      ? t("duration.oneDay")
      : t("duration.manyDays", { count: formatAppNumber(dayCount, locale) });
  const accessibleName = `${trip.name}, ${dateRange}, ${durationLabel}`;

  return (
    <Link
      href={`/app/trips/${trip.id}`}
      className={styles.tripCardLink}
      aria-label={accessibleName}
    >
      <article className={styles.tripCard} data-phase={trip.phase}>
        <div className={styles.tripCardMedia}>
          <Image
            src={trip.imageSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 50vw, 100vw"
            className={styles.tripCardImage}
            unoptimized={trip.hasPersistedCover}
          />
          <div className={styles.tripCardOverlay} />

          <div className={styles.tripCardContent}>
            <div className={styles.tripCardMain}>
              <h2 className={styles.tripCardName}>{trip.name}</h2>
              <p className={styles.tripCardDates}>{dateRange}</p>
              <p className={styles.tripCardMeta}>{durationLabel}</p>
            </div>

            <div className={styles.tripCardActions}>
              {trip.phase === "active" ? (
                <span className={styles.tripCardActiveBadge}>
                  {t("phases.active")}
                </span>
              ) : null}
              <span className={styles.tripCardChevron} aria-hidden="true">
                ›
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
