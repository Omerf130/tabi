import Link from "next/link";
import { IconChevron, IconItinerary } from "@/components/ui/icons";
import type { AfterTripFinanceRecapViewModel } from "@/features/finance/types";
import { AfterTripFinanceRecap } from "./AfterTripFinanceRecap";
import type { AfterTripSummaryMetric } from "./build-after-trip-summary";
import type { TripHomeItineraryRevisit } from "./types";
import styles from "./TripHomeContent.module.scss";

export const AFTER_SURFACE_SECTION_ORDER = [
  "tripSummary",
  "financeRecap",
  "itineraryRevisit",
] as const;

type AfterTripJourneyProps = {
  tripSummary: AfterTripSummaryMetric[];
  financeRecap: AfterTripFinanceRecapViewModel;
  itineraryRevisit: TripHomeItineraryRevisit;
};

export function AfterTripJourney({
  tripSummary,
  financeRecap,
  itineraryRevisit,
}: AfterTripJourneyProps) {
  return (
    <section className={styles.afterJourney} aria-label="אחרי הטיול">
      <section className={styles.homeSection} aria-label="סיכום הטיול">
        <div className={styles.homeSectionHeader}>
          <h2 className={styles.homeSectionTitle}>סיכום הטיול</h2>
        </div>
        <ul className={styles.summaryMetricGrid}>
          {tripSummary.map((metric) => (
            <li key={metric.id} className={styles.summaryMetricTile}>
              <span className={styles.summaryMetricValue}>{metric.value}</span>
              <span className={styles.summaryMetricLabel}>{metric.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <AfterTripFinanceRecap recap={financeRecap} />

      <section className={styles.homeSection} aria-label="מסלול">
        <Link href={itineraryRevisit.href} className={styles.afterEntryRow}>
          <span className={styles.afterEntryIconWrap} aria-hidden>
            <IconItinerary className={styles.afterEntryIcon} />
          </span>
          <span className={styles.afterEntryCopy}>
            <span className={styles.afterEntryTitle}>{itineraryRevisit.title}</span>
            <span className={styles.afterEntryDescription}>
              {itineraryRevisit.description}
            </span>
          </span>
          <IconChevron className={styles.afterEntryChevron} aria-hidden />
        </Link>
      </section>
    </section>
  );
}
