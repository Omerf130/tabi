import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge/Badge";
import { IconChevron } from "@/components/ui/icons";
import { FocusedDayCard } from "./FocusedDayCard";
import type { DaySummaryViewModel, FocusedDayCardViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

type DaySummaryListProps = {
  days: readonly DaySummaryViewModel[];
  focusedDayCard?: FocusedDayCardViewModel | null;
};

async function formatCounts(
  day: DaySummaryViewModel,
  tCommon: Awaited<ReturnType<typeof getTranslations<"Common">>>,
): Promise<string> {
  const parts: string[] = [];

  if (day.activityCount > 0) {
    parts.push(tCommon("activityCount", { count: day.activityCount }));
  }

  if (day.transportCount > 0) {
    parts.push(tCommon("transportCount", { count: day.transportCount }));
  }

  if (day.documentCount > 0) {
    parts.push(tCommon("documentCount", { count: day.documentCount }));
  }

  if (parts.length === 0) {
    return tCommon("noItems");
  }

  return parts.join(" · ");
}

async function CompactDayRow({ day }: { day: DaySummaryViewModel }) {
  const tCommon = await getTranslations("Common");
  const contextLine =
    day.accommodationLabel ?? day.transportPreview ?? day.activityPreview ?? null;
  const dayCount = await formatCounts(day, tCommon);

  return (
    <Link
      href={day.href}
      className={styles.daySummaryLink}
      data-temporal={day.temporalState}
    >
      <span className={styles.daySummaryMain}>
        <span className={styles.daySummaryIdentity}>
          <span className={styles.dayNumber}>
            {tCommon("dayNumber", { dayNumber: day.dayNumber })}
          </span>
          <span className={styles.dayMetaInline}>
            {day.weekdayLabel}, {day.dateLabel}
          </span>
          {day.temporalState === "today" ? (
            <Badge tone="accent">{tCommon("today")}</Badge>
          ) : null}
          {day.hasIncompleteReminder ? (
            <span className={styles.reminderIndicator} aria-label={tCommon("openReminderAria")}>
              ●
            </span>
          ) : null}
        </span>
        {contextLine ? (
          <span className={styles.daySummaryContext} dir="auto">
            {contextLine}
          </span>
        ) : null}
        <span className={styles.dayCount}>{dayCount}</span>
      </span>
      <IconChevron className={styles.daySummaryChevron} aria-hidden />
    </Link>
  );
}

export async function DaySummaryList({ days, focusedDayCard }: DaySummaryListProps) {
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
