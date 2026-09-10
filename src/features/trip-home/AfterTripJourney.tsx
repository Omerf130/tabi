import Link from "next/link";
import { IconChevron, IconItinerary, IconMemories } from "@/components/ui/icons";
import type {
  TripHomeItineraryRevisit,
  TripHomeMemoriesEntry,
} from "./types";
import styles from "./TripHomeContent.module.scss";

export const AFTER_SURFACE_SECTION_ORDER = ["memories", "itineraryRevisit"] as const;

type AfterTripJourneyProps = {
  memories: TripHomeMemoriesEntry;
  itineraryRevisit: TripHomeItineraryRevisit;
};

function AfterEntryCard({
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
    <Link href={href} className={styles.afterEntryCard}>
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
  memories,
  itineraryRevisit,
}: AfterTripJourneyProps) {
  return (
    <section className={styles.afterJourney} aria-label="אחרי הטיול">
      <div className={styles.afterJourneyInner}>
        <AfterEntryCard
          href={memories.href}
          icon={IconMemories}
          title={memories.title}
          description={memories.description}
        />
        <AfterEntryCard
          href={itineraryRevisit.href}
          icon={IconItinerary}
          title={itineraryRevisit.title}
          description={itineraryRevisit.description}
        />
      </div>
    </section>
  );
}
