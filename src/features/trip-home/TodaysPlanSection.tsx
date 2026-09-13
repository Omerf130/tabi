import Link from "next/link";
import { IconActivityTransport } from "@/components/ui/icons";
import type { TripHomeItinerarySection } from "./types";
import styles from "./TripHomeContent.module.scss";

type TodaysPlanSectionProps = {
  section: TripHomeItinerarySection;
};

export function TodaysPlanSection({ section }: TodaysPlanSectionProps) {
  return (
    <section className={styles.homeSection} aria-labelledby="trip-home-plan">
      <div className={styles.homeSectionHeader}>
        <h2 id="trip-home-plan" className={styles.homeSectionTitle}>
          {section.title}
        </h2>
        {!section.isEmpty ? (
          <Link href={section.ctaHref} className={styles.homeSectionAction}>
            {section.ctaLabel}
          </Link>
        ) : null}
      </div>

      {section.dayMeta || section.subtitle ? (
        <p className={styles.homeRowMeta}>
          {section.dayMeta}
          {section.subtitle ? (
            <>
              <span className={styles.heroDot}>·</span>
              {section.subtitle}
            </>
          ) : null}
        </p>
      ) : null}

      {section.isEmpty ? (
        <div className={styles.duringPlanEmptyState}>
          <p className={styles.duringPlanEmptyTitle}>אין תוכניות להיום עדיין</p>
          <p className={styles.duringPlanEmptyHint}>
            היום שלך עדיין פתוח. אפשר להוסיף פעילות למסלול.
          </p>
          <Link href={section.ctaHref} className={styles.duringPlanEmptyAction}>
            למסלול של היום
          </Link>
        </div>
      ) : (
        <>
          <ol
            className={styles.duringPlanTimeline}
            data-single-item={section.items.length === 1 ? "true" : undefined}
          >
            {section.items.map((item, index) => (
              <li
                key={item.id}
                className={styles.duringPlanItem}
                data-single={section.items.length === 1 ? "true" : undefined}
                data-last={index === section.items.length - 1 ? "true" : undefined}
              >
                <div className={styles.duringPlanTimeCol}>
                  {item.isUntimed ? (
                    <span className={styles.duringPlanTimeMuted}>ללא שעה</span>
                  ) : (
                    <time className={styles.duringPlanTime}>{item.displayTime}</time>
                  )}
                </div>
                <span className={styles.duringPlanRail} aria-hidden>
                  <span className={styles.duringPlanDot} data-state="upcoming" />
                  {index < section.items.length - 1 ? (
                    <span className={styles.duringPlanLine} />
                  ) : null}
                </span>
                <div className={styles.duringPlanContent}>
                  <div className={styles.duringPlanTitleRow}>
                    {item.kind === "transport" ? (
                      <IconActivityTransport
                        className={styles.duringPlanTransportIcon}
                        aria-hidden
                      />
                    ) : null}
                    <p className={styles.duringPlanItemTitle} dir="auto">
                      {item.title}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {section.overflowCount > 0 ? (
            <p className={styles.duringPlanOverflow}>ועוד {section.overflowCount}</p>
          ) : null}
        </>
      )}
    </section>
  );
}
