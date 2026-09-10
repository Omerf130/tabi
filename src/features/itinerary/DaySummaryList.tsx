import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { IconChevron } from "@/components/ui/icons";
import { FocusedDayCard } from "./FocusedDayCard";
import type { DaySummaryViewModel, FocusedDayCardViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

type DaySummaryListProps = {
  days: readonly DaySummaryViewModel[];
  focusedDayCard?: FocusedDayCardViewModel | null;
};

function formatCounts(day: DaySummaryViewModel): string {
  const parts: string[] = [];

  if (day.activityCount > 0) {
    parts.push(
      day.activityCount === 1 ? "פעילות אחת" : `${day.activityCount} פעילויות`,
    );
  }

  if (day.transportCount > 0) {
    parts.push(
      day.transportCount === 1 ? "תחבורה אחת" : `${day.transportCount} תחבורה`,
    );
  }

  if (day.documentCount > 0) {
    parts.push(
      day.documentCount === 1 ? "מסמך אחד" : `${day.documentCount} מסמכים`,
    );
  }

  if (parts.length === 0) {
    return "אין פריטים";
  }

  return parts.join(" · ");
}

function buildContextLine(day: DaySummaryViewModel): string | null {
  if (day.accommodationLabel) {
    return day.accommodationLabel;
  }
  if (day.transportPreview) {
    return day.transportPreview;
  }
  if (day.activityPreview) {
    return day.activityPreview;
  }
  return null;
}

function CompactDayRow({ day }: { day: DaySummaryViewModel }) {
  const contextLine = buildContextLine(day);

  return (
    <Link
      href={day.href}
      className={styles.daySummaryLink}
      data-temporal={day.temporalState}
    >
      <span className={styles.daySummaryMain}>
        <span className={styles.daySummaryIdentity}>
          <span className={styles.dayNumber}>יום {day.dayNumber}</span>
          <span className={styles.dayMetaInline}>
            {day.weekdayLabel}, {day.dateLabel}
          </span>
          {day.temporalState === "today" ? (
            <Badge tone="accent">היום</Badge>
          ) : null}
          {day.hasIncompleteReminder ? (
            <span className={styles.reminderIndicator} aria-label="יש תזכורת פתוחה">
              ●
            </span>
          ) : null}
        </span>
        {contextLine ? (
          <span className={styles.daySummaryContext} dir="auto">
            {contextLine}
          </span>
        ) : null}
        <span className={styles.dayCount}>{formatCounts(day)}</span>
      </span>
      <IconChevron className={styles.daySummaryChevron} aria-hidden />
    </Link>
  );
}

export function DaySummaryList({ days, focusedDayCard }: DaySummaryListProps) {
  return (
    <div className={styles.dayList}>
      {days.map((day) => {
        if (focusedDayCard && day.date === focusedDayCard.date) {
          return <FocusedDayCard key={day.date} card={focusedDayCard} />;
        }

        return <CompactDayRow key={day.date} day={day} />;
      })}
    </div>
  );
}
