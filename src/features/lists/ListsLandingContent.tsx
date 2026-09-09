import Link from "next/link";
import {
  IconActivityShopping,
  IconGrid,
  IconItinerary,
  IconPlane,
} from "@/components/ui/icons";
import { AppPage } from "@/features/app-shell/AppPage";
import { buildListDetailHref } from "./constants";
import { ListProgressBar } from "./ListProgressBar";
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

export function ListsLandingContent({ tripId, lists }: ListsLandingContentProps) {
  return (
    <AppPage width="content">
      <ul className={styles.list}>
        {lists.map((list) => (
            <li key={list.type}>
              <Link
                href={buildListDetailHref(tripId, list.slug)}
                className={styles.cardLink}
              >
                <article className={styles.card}>
                  <ListIcon icon={list.icon} className={styles.cardIcon} aria-hidden />
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{list.title}</h2>
                    <ListProgressBar
                      progress={list.progress}
                      label={list.progressLabel}
                      title={list.title}
                    />
                  </div>
                </article>
              </Link>
            </li>
        ))}
      </ul>
    </AppPage>
  );
}
