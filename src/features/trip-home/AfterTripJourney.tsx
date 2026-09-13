import Link from "next/link";
import { IconChevron, IconItinerary, IconMemories } from "@/components/ui/icons";
import type { AfterTripFinanceRecapViewModel } from "@/features/finance/types";
import { AfterTripFinanceRecap } from "./AfterTripFinanceRecap";
import type { AfterTripSummaryMetric } from "./build-after-trip-summary";
import type {
  TripHomeItineraryRevisit,
  TripHomeMemoriesEntry,
} from "./types";
import styles from "./TripHomeContent.module.scss";

export const AFTER_SURFACE_SECTION_ORDER = [
  "tripSummary",
  "financeRecap",
  "memories",
  "itineraryRevisit",
] as const;

type AfterTripJourneyProps = {
  tripSummary: AfterTripSummaryMetric[];
  memories: TripHomeMemoriesEntry;
  financeRecap: AfterTripFinanceRecapViewModel;
  itineraryRevisit: TripHomeItineraryRevisit;
};

function AfterEntryRow({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof IconMemories;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className={styles.afterEntryRow}>
      <span className={styles.afterEntryIconWrap} aria-hidden>
        <Icon className={styles.afterEntryIcon} />
      </span>
      <span className={styles.afterEntryCopy}>
        <span className={styles.afterEntryTitle}>{title}</span>
        <span className={styles.afterEntryDescription}>{description}</span>
      </span>
      <IconChevron className={styles.afterEntryChevron} aria-hidden />
    </Link>
  );
}

export function AfterTripJourney({
  tripSummary,
  memories,
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

      <section className={styles.homeSection} aria-label="זיכרונות ומסלול">
        <AfterEntryRow
          href={memories.href}
          icon={IconMemories}
          title={memories.title}
          description={memories.description}
        />
        <AfterEntryRow
          href={itineraryRevisit.href}
          icon={IconItinerary}
          title={itineraryRevisit.title}
          description={itineraryRevisit.description}
        />
      </section>
    </section>
  );
}
