import type { CSSProperties } from "react";
import Link from "next/link";
import {
  IconAccommodation,
  IconActivityOther,
  IconActivityTransport,
  IconChevron,
  IconGrid,
} from "@/components/ui/icons";
import { DayOnePhoto } from "./DayOnePhoto.client";
import type {
  TripHomeBeforeJourneyViewModel,
  TripHomeDayOnePreview,
} from "./types";
import type { DayOnePreviewItem } from "./build-day-one-home-preview";
import type { HomePreparationViewModel } from "./build-home-preparation";
import type { UpcomingHomeReminderItem } from "@/features/trips/reminders/select-upcoming-home-reminders";
import styles from "./TripHomeContent.module.scss";

type BeforeTripJourneyProps = {
  journey: TripHomeBeforeJourneyViewModel;
};

function PreparationProgressRing({
  percentage,
}: {
  percentage: number | null;
}) {
  const progress = percentage ?? 0;

  return (
    <div
      className={styles.preparationRing}
      style={{ "--preparation-progress": `${progress}` } as CSSProperties}
      aria-hidden
    >
      <div className={styles.preparationRingInner}>
        <span className={styles.preparationRingValue}>
          {percentage === null ? "—" : `${percentage}%`}
        </span>
      </div>
    </div>
  );
}

function PreparationBlock({
  preparation,
}: {
  preparation: HomePreparationViewModel;
}) {
  return (
    <Link href={preparation.listsHref} className={styles.beforeInnerCard}>
      <div className={styles.beforeInnerHeader}>
        <span className={styles.beforeInnerIconWrap} aria-hidden>
          <IconGrid className={styles.beforeInnerIcon} />
        </span>
        <span className={styles.beforeInnerTitle}>לקראת הטיול</span>
        <IconChevron className={styles.beforeInnerChevron} aria-hidden />
      </div>

      <div className={styles.preparationBody}>
        <PreparationProgressRing percentage={preparation.percentage} />
        <div className={styles.preparationSummary}>
          <p className={styles.preparationProgressLabel}>
            {preparation.progressLabel}
          </p>
          {preparation.previewItems.length > 0 ? (
            <ul className={styles.preparationChecklist}>
              {preparation.previewItems.map((item) => (
                <li
                  key={item.id}
                  className={styles.preparationChecklistItem}
                  data-completed={item.isCompleted ? "true" : "false"}
                >
                  <span className={styles.preparationCheck} aria-hidden>
                    {item.isCompleted ? "✓" : ""}
                  </span>
                  <span dir="auto">{item.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function RemindersBlock({
  reminders,
  settingsHref,
}: {
  reminders: readonly UpcomingHomeReminderItem[];
  settingsHref: string;
}) {
  return (
    <div className={styles.beforeInnerSection}>
      <div className={styles.beforeInnerHeaderStatic}>
        <span className={styles.beforeInnerTitle}>תזכורות קרובות</span>
        <Link href={settingsHref} className={styles.beforeInnerAction}>
          ניהול
        </Link>
      </div>
      <ul className={styles.beforeReminderList}>
        {reminders.map((reminder) => (
          <li key={reminder.id} className={styles.beforeReminderItem}>
            <span className={styles.beforeReminderIndicator} aria-hidden />
            <div className={styles.beforeReminderContent}>
              <p className={styles.beforeReminderText} dir="auto">
                {reminder.text}
              </p>
              <p className={styles.beforeReminderMeta}>
                {reminder.dateLabel}
                <span className={styles.heroDot}>·</span>
                {reminder.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DayOnePreviewIcon({ item }: { item: DayOnePreviewItem }) {
  if (item.kind === "transport") {
    return <IconActivityTransport className={styles.dayOneItemIcon} aria-hidden />;
  }
  if (item.kind === "accommodation") {
    return <IconAccommodation className={styles.dayOneItemIcon} aria-hidden />;
  }
  return <IconActivityOther className={styles.dayOneItemIcon} aria-hidden />;
}

function DayOneBlock({ dayOne }: { dayOne: TripHomeDayOnePreview }) {
  return (
    <div className={styles.beforeInnerCard}>
      <Link href={dayOne.dayHref} className={styles.beforeInnerHeaderLink}>
        <span className={styles.beforeInnerTitle}>מבט ליום הראשון</span>
        <IconChevron className={styles.beforeInnerChevron} aria-hidden />
      </Link>

      <div className={styles.dayOneBody}>
        <div className={styles.dayOneCopy}>
          <p className={styles.dayOneMeta}>{dayOne.dayMeta}</p>
          <p className={styles.dayOneDate}>
            {dayOne.weekdayLabel} · {dayOne.dateLabel}
          </p>

          {dayOne.isEmpty ? (
            <p className={styles.dayOneEmpty}>{dayOne.emptyMessage}</p>
          ) : (
            <ul className={styles.dayOneItems}>
              {dayOne.items.map((item) => (
                <li key={item.id} className={styles.dayOneItem}>
                  <DayOnePreviewIcon item={item} />
                  <div className={styles.dayOneItemContent}>
                    <p className={styles.dayOneItemTitle} dir="auto">
                      {item.title}
                    </p>
                    {item.displayTime || item.subtitle ? (
                      <p className={styles.dayOneItemMeta} dir="auto">
                        {item.displayTime}
                        {item.displayTime && item.subtitle ? (
                          <span className={styles.heroDot}>·</span>
                        ) : null}
                        {item.subtitle}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {dayOne.overflowCount > 0 ? (
            <p className={styles.dayOneOverflow}>ועוד {dayOne.overflowCount}</p>
          ) : null}
        </div>

        <DayOnePhoto photoPresentation={dayOne.photoPresentation} />
      </div>
    </div>
  );
}

export function BeforeTripJourney({ journey }: BeforeTripJourneyProps) {
  return (
    <section className={styles.beforeJourney} aria-label="הכנה לטיול">
      <div className={styles.beforeJourneyPrimary}>
        {journey.preparation ? (
          <PreparationBlock preparation={journey.preparation} />
        ) : null}

        {journey.upcomingReminders ? (
          <RemindersBlock
            reminders={journey.upcomingReminders}
            settingsHref={journey.remindersSettingsHref}
          />
        ) : null}
      </div>

      <div className={styles.beforeJourneySecondary}>
        <DayOneBlock dayOne={journey.dayOne} />
      </div>

      <Link href={journey.itineraryCta.href} className={styles.beforeJourneyCta}>
        {journey.itineraryCta.label}
      </Link>
    </section>
  );
}
