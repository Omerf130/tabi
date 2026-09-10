import Link from "next/link";
import { IconActivityTransport, IconCalendar, IconChevron } from "@/components/ui/icons";
import type { TripHomeItinerarySection } from "./types";
import styles from "./TripHomeContent.module.scss";

type TodaysPlanSectionProps = {
  section: TripHomeItinerarySection;
};

export function TodaysPlanSection({ section }: TodaysPlanSectionProps) {
  return (
    <section className={styles.duringPlan} aria-labelledby="trip-home-plan">
      <header className={styles.duringPlanHeader}>
        <div className={styles.duringBlockHeaderStart}>
          <IconCalendar className={styles.duringBlockIcon} aria-hidden />
          <h2 id="trip-home-plan" className={styles.duringBlockTitle}>
            {section.title}
          </h2>
        </div>
        <Link href={section.ctaHref} className={styles.duringPlanDayLink}>
          יום מלא
          <IconChevron className={styles.duringPlanDayLinkChevron} aria-hidden />
        </Link>
      </header>

      {section.isEmpty ? (
        <p className={styles.duringPlanEmpty}>{section.emptyMessage}</p>
      ) : (
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
      )}

      {section.overflowCount > 0 ? (
        <p className={styles.duringPlanOverflow}>ועוד {section.overflowCount}</p>
      ) : null}
    </section>
  );
}
