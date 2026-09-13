import type { CSSProperties } from "react";
import Link from "next/link";
import {
  IconAccommodation,
  IconActivityOther,
  IconActivityTransport,
  IconChevron,
} from "@/components/ui/icons";
import { DayOnePhoto } from "./DayOnePhoto.client";
import type {
  TripHomeBeforeJourneyViewModel,
  TripHomeDayOnePreview,
} from "./types";
import type { DayOnePreviewItem } from "./build-day-one-home-preview";
import type { HomePreparationViewModel } from "./build-home-preparation";
import { BeforeTripRemindersSection } from "./BeforeTripRemindersSection.client";
import styles from "./TripHomeContent.module.scss";

type BeforeTripJourneyProps = {
  journey: TripHomeBeforeJourneyViewModel;
};

function ListTilesSection({
  preparation,
}: {
  preparation: HomePreparationViewModel;
}) {
  if (preparation.listTiles.length === 0) {
    return null;
  }

  return (
    <section className={styles.homeSection} aria-label="רשימות והכנות">
      <div className={styles.homeSectionHeader}>
        <h2 className={styles.homeSectionTitle}>רשימות והכנות</h2>
        <Link href={preparation.listsHref} className={styles.homeSectionAction}>
          הכל
        </Link>
      </div>
      <ul className={styles.listTileGrid}>
        {preparation.listTiles.map((tile) => (
          <li key={tile.type}>
            <Link href={tile.href} className={styles.listTile}>
              <span className={styles.listTileTitle}>{tile.title}</span>
              <span className={styles.listTileProgress}>
                {tile.completedCount}/{tile.totalCount}
              </span>
              <span
                className={styles.listTileBar}
                style={{
                  "--list-progress": `${Math.round((tile.completedCount / tile.totalCount) * 100)}%`,
                } as CSSProperties}
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
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

function DayOneSection({ dayOne }: { dayOne: TripHomeDayOnePreview }) {
  const hasPhoto = dayOne.photoPresentation.hasPhoto;
  const primaryItem = dayOne.items[0];

  return (
    <section className={styles.homeSection} aria-label="מבט ליום הראשון">
      <div className={styles.homeSectionHeader}>
        <h2 className={styles.homeSectionTitle}>מבט ליום הראשון</h2>
        <Link href={dayOne.dayHref} className={styles.homeSectionAction}>
          פרטים
        </Link>
      </div>

      <Link href={dayOne.dayHref} className={styles.dayOnePreviewRow}>
        {hasPhoto ? (
          <DayOnePhoto photoPresentation={dayOne.photoPresentation} />
        ) : null}

        <div className={styles.dayOnePreviewCopy}>
          <p className={styles.dayOneMeta}>{dayOne.dayMeta}</p>
          <p className={styles.dayOneDate}>
            {dayOne.weekdayLabel} · {dayOne.dateLabel}
          </p>

          {dayOne.isEmpty ? (
            <p className={styles.dayOneEmpty}>{dayOne.emptyMessage}</p>
          ) : primaryItem ? (
            <>
              <p className={styles.dayOnePrimaryTitle} dir="auto">
                {primaryItem.title}
              </p>
              {primaryItem.displayTime || primaryItem.subtitle ? (
                <p className={styles.dayOnePrimaryMeta} dir="auto">
                  {primaryItem.displayTime}
                  {primaryItem.displayTime && primaryItem.subtitle ? (
                    <span className={styles.heroDot}>·</span>
                  ) : null}
                  {primaryItem.subtitle}
                </p>
              ) : null}
              {dayOne.items.length > 1 ? (
                <ul className={styles.dayOneItemsCompact}>
                  {dayOne.items.slice(1, 3).map((item) => (
                    <li key={item.id} className={styles.dayOneItemCompact}>
                      <DayOnePreviewIcon item={item} />
                      <span dir="auto">{item.title}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {dayOne.overflowCount > 0 ? (
                <p className={styles.dayOneOverflow}>ועוד {dayOne.overflowCount}</p>
              ) : null}
            </>
          ) : null}
        </div>

        <IconChevron className={styles.dayOnePreviewChevron} aria-hidden />
      </Link>
    </section>
  );
}

export function BeforeTripJourney({ journey }: BeforeTripJourneyProps) {
  return (
    <section className={styles.beforeJourney} aria-label="הכנה לטיול">
      <BeforeTripRemindersSection reminders={journey.upcomingReminders ?? []} />

      {journey.preparation ? (
        <ListTilesSection preparation={journey.preparation} />
      ) : null}

      <DayOneSection dayOne={journey.dayOne} />

      <Link href={journey.itineraryCta.href} className={styles.beforeJourneyCta}>
        {journey.itineraryCta.label}
      </Link>
    </section>
  );
}
