import Link from "next/link";
import {
  IconActivityShopping,
  IconGrid,
  IconItinerary,
  IconPlane,
} from "@/components/ui/icons";
import { AppPage } from "@/features/app-shell/AppPage";
import { buildListDetailHref } from "./constants";
import type { TripListSummaryViewModel } from "./types";
import styles from "./ListsLanding.module.scss";

type ListsLandingContentProps = {
  tripId: string;
  lists: TripListSummaryViewModel[];
};

function ListIcon({
  icon,
  className,
}: {
  icon: TripListSummaryViewModel["icon"];
  className?: string;
}) {
  switch (icon) {
    case "grid":
      return <IconGrid className={className} />;
    case "plane":
      return <IconPlane className={className} />;
    case "itinerary":
      return <IconItinerary className={className} />;
    case "shopping":
      return <IconActivityShopping className={className} />;
    default:
      return <IconGrid className={className} />;
  }
}

function progressPercent(progress: TripListSummaryViewModel["progress"]): number {
  if (progress.totalCount === 0) {
    return 0;
  }
  return Math.round((progress.completedCount / progress.totalCount) * 100);
}

export function ListsLandingContent({ tripId, lists }: ListsLandingContentProps) {
  return (
    <AppPage width="content">
      <ul className={styles.list}>
        {lists.map((list) => {
          const percent = progressPercent(list.progress);

          return (
            <li key={list.type}>
              <Link
                href={buildListDetailHref(tripId, list.slug)}
                className={styles.cardLink}
              >
                <article className={styles.card}>
                  <ListIcon icon={list.icon} className={styles.cardIcon} aria-hidden />
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{list.title}</h2>
                    <p className={styles.cardProgress}>{list.progressLabel}</p>
                    <div
                      className={styles.progressTrack}
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${list.title}: ${list.progressLabel}`}
                    >
                      <div
                        className={styles.progressFill}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </article>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppPage>
  );
}
