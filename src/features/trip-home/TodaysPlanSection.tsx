import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IconActivityTransport } from "@/components/ui/icons";
import { TodaysPlanEmpty } from "./TodaysPlanEmpty.client";
import type { TripHomeItinerarySection } from "./types";
import styles from "./TripHomeContent.module.scss";

type TodaysPlanSectionProps = {
  section: TripHomeItinerarySection;
};

export async function TodaysPlanSection({ section }: TodaysPlanSectionProps) {
  const tCommon = await getTranslations("Common");

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
        <TodaysPlanEmpty ctaHref={section.ctaHref} />
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
                    <span className={styles.duringPlanTimeMuted}>{tCommon("noTime")}</span>
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
            <p className={styles.duringPlanOverflow}>
              {tCommon("andMore", { count: section.overflowCount })}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
