import Link from "next/link";
import type {
  DailyItineraryPreviewItem,
  DailyItinerarySummary,
  TripHomeViewModel,
} from "./types";
import styles from "./TripHomeContent.module.scss";

function phaseLabel(model: TripHomeViewModel): string {
  if (model.phase === "upcoming") {
    return "לפני הטיול";
  }
  if (model.phase === "active") {
    return "בזמן הטיול";
  }
  return "אחרי הטיול";
}

type HeroMediaProps = {
  model: TripHomeViewModel;
};

function HeroMedia({ model }: HeroMediaProps) {
  const hasCover = Boolean(model.coverImageHref);

  return (
    <>
      {hasCover && model.coverImageHref ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={model.coverImageHref}
          alt=""
          className={styles.heroImage}
        />
      ) : null}
      <div className={styles.heroBackdrop} aria-hidden />
    </>
  );
}

function HeroIdentity({
  model,
  compact = false,
}: {
  model: TripHomeViewModel;
  compact?: boolean;
}) {
  return (
    <div className={styles.heroIdentity}>
      <span className={styles.heroMark} aria-hidden>
        日本
      </span>
      <p className={styles.heroPhase}>{phaseLabel(model)}</p>
      <h1
        className={styles.heroTitle}
        data-compact={compact ? "true" : undefined}
      >
        {model.tripName}
      </h1>
      {model.phase !== "active" ? (
        <p className={styles.heroDates}>{model.dateRangeLabel}</p>
      ) : null}
      {model.phase === "active" && model.currentDay ? (
        <p className={styles.heroDayMeta}>
          יום {model.currentDay.dayNumber} מתוך {model.currentDay.totalDays}
          <span className={styles.heroDayDivider}>·</span>
          {model.currentDay.weekdayLabel} · {model.currentDay.dateLabel}
        </p>
      ) : null}
    </div>
  );
}

function countdownUnit(days: number): string {
  if (days === 0) {
    return "היום";
  }
  if (days === 1) {
    return "יום";
  }
  return "ימים";
}

function countdownValue(days: number): string {
  return days === 0 ? "0" : String(days);
}

function HeroCountdown({ countdownDays = 0 }: { countdownDays?: number }) {
  return (
    <div className={styles.heroCountdown} aria-label="ספירה לאחור">
      <p className={styles.countdownLead}>הטיול מתחיל בעוד</p>
      <p className={styles.countdownFigure}>
        <span className={styles.countdownValue}>
          {countdownValue(countdownDays)}
        </span>
        <span className={styles.countdownUnit}>{countdownUnit(countdownDays)}</span>
      </p>
    </div>
  );
}

function HeroClosing({ model }: { model: TripHomeViewModel }) {
  return (
    <div className={styles.heroClosing}>
      {model.statusLine ? (
        <p className={styles.closingStatus}>{model.statusLine}</p>
      ) : null}
      {model.closingLine ? (
        <p className={styles.closingLine}>{model.closingLine}</p>
      ) : null}
    </div>
  );
}

type HeroCompositionProps = {
  model: TripHomeViewModel;
};

export function UpcomingHomeHero({ model }: HeroCompositionProps) {
  const hasCover = Boolean(model.coverImageHref);

  return (
    <section
      className={styles.heroComposition}
      data-phase="upcoming"
      data-has-cover={hasCover ? "true" : "false"}
      aria-label="זהות הטיול"
    >
      <div className={styles.heroMedia}>
        <HeroMedia model={model} />
      </div>
      <div className={styles.heroBody}>
        <HeroIdentity model={model} />
        <div className={styles.heroFooter}>
          <HeroCountdown countdownDays={model.countdownDays} />
        </div>
      </div>
    </section>
  );
}

export function ActiveHomeHero({ model }: HeroCompositionProps) {
  const hasCover = Boolean(model.coverImageHref);

  return (
    <section
      className={styles.heroComposition}
      data-phase="active"
      data-has-cover={hasCover ? "true" : "false"}
      aria-label="זהות הטיול"
    >
      <div className={styles.heroMedia}>
        <HeroMedia model={model} />
      </div>
      <div className={styles.heroBody}>
        <HeroIdentity model={model} compact />
      </div>
    </section>
  );
}

export function CompletedHomeHero({ model }: HeroCompositionProps) {
  const hasCover = Boolean(model.coverImageHref);

  return (
    <section
      className={styles.heroComposition}
      data-phase="completed"
      data-has-cover={hasCover ? "true" : "false"}
      aria-label="זהות הטיול"
    >
      <div className={styles.heroMedia}>
        <HeroMedia model={model} />
      </div>
      <div className={styles.heroBody}>
        <HeroIdentity model={model} />
        <div className={styles.heroFooter}>
          <HeroClosing model={model} />
        </div>
      </div>
    </section>
  );
}

function emphasisLabel(emphasis: DailyItineraryPreviewItem["emphasis"]): string | null {
  if (emphasis === "now") {
    return "עכשיו";
  }
  if (emphasis === "next") {
    return "הבא בתור";
  }
  return null;
}

function TimelineItem({
  item,
  isLast,
}: {
  item: DailyItineraryPreviewItem;
  isLast: boolean;
}) {
  const label = emphasisLabel(item.emphasis);

  return (
    <li
      className={styles.timelineItem}
      data-emphasis={item.emphasis}
      data-last={isLast ? "true" : undefined}
    >
      <div className={styles.timelineTimeColumn}>
        {item.isUntimed ? (
          <span className={styles.timelineTimeMuted}>ללא שעה</span>
        ) : (
          <time className={styles.timelineTime}>{item.displayTime}</time>
        )}
      </div>
      <span className={styles.timelineRail} aria-hidden>
        <span className={styles.timelineDot} />
        {!isLast ? <span className={styles.timelineLine} /> : null}
      </span>
      <div className={styles.timelineContent}>
        <div className={styles.timelineTitleRow}>
          <p className={styles.timelineTitle} dir="auto">
            {item.title}
          </p>
          {label ? <span className={styles.timelineEmphasis}>{label}</span> : null}
        </div>
        {item.locationName ? (
          <p className={styles.timelineLocation} dir="auto">
            {item.locationName}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function DailyItinerarySummarySection({
  summary,
}: {
  summary: DailyItinerarySummary;
}) {
  return (
    <section className={styles.dailyItinerary} aria-label={summary.title}>
      <header className={styles.dailyItineraryHeader}>
        <h2 className={styles.dailyItineraryTitle}>{summary.title}</h2>
        {summary.subtitle ? (
          <p className={styles.dailyItinerarySubtitle}>{summary.subtitle}</p>
        ) : null}
        {summary.dayMeta ? (
          <p className={styles.dailyItineraryMeta}>{summary.dayMeta}</p>
        ) : null}
      </header>

      {summary.isEmpty ? (
        <p className={styles.dailyItineraryEmpty}>{summary.emptyMessage}</p>
      ) : (
        <ol className={styles.timeline}>
          {summary.items.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              isLast={index === summary.items.length - 1}
            />
          ))}
        </ol>
      )}

      {summary.overflowCount > 0 ? (
        <p className={styles.dailyItineraryOverflow}>
          ועוד {summary.overflowCount}
        </p>
      ) : null}

      <Link href={summary.ctaHref} className={styles.dailyItineraryCta}>
        {summary.ctaLabel}
      </Link>
    </section>
  );
}

export function CompletedItineraryEntry({ model }: HeroCompositionProps) {
  return (
    <section className={styles.completedEntry} aria-label="כניסה למסלול">
      <Link href={model.itineraryHref} className={styles.completedEntryLink}>
        {model.primaryCtaLabel} ←
      </Link>
    </section>
  );
}
