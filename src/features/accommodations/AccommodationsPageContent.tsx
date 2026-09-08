import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { IconChevron } from "@/components/ui/icons";
import { AppPage } from "@/features/app-shell/AppPage";
import {
  buildAccommodationDetailHref,
  getAccommodationsSettingsHref,
} from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import styles from "./AccommodationsPage.module.scss";

type AccommodationsPageContentProps = {
  tripId: string;
  accommodations: AccommodationViewModel[];
  isOwner: boolean;
};

export function AccommodationsPageContent({
  tripId,
  accommodations,
  isOwner,
}: AccommodationsPageContentProps) {
  return (
    <AppPage width="content">
      {accommodations.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>אין מקומות לינה</p>
          <p className={styles.emptyHint}>
            {isOwner
              ? "הוסיפו מקומות לינה בהגדרות הטיול כדי שיופיעו כאן."
              : "בעל הטיול עדיין לא הוסיף מקומות לינה."}
          </p>
          {isOwner ? (
            <Link href={getAccommodationsSettingsHref(tripId)} className={styles.emptyLink}>
              להגדרות הטיול
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className={styles.list}>
          {accommodations.map((accommodation) => (
            <li key={accommodation.id}>
              <Link
                href={buildAccommodationDetailHref(tripId, accommodation.id)}
                className={styles.cardLink}
              >
                <Card variant="standard">
                  <div className={styles.cardBody}>
                    <div className={styles.cardMain}>
                      <p className={styles.cardName} dir="auto">
                        {accommodation.name}
                      </p>
                      <p className={styles.cardMeta}>
                        {accommodation.city} · {accommodation.dateRangeLabel}
                      </p>
                      <p className={styles.cardNights}>
                        {accommodation.nightCount}{" "}
                        {accommodation.nightCount === 1 ? "לילה" : "לילות"}
                      </p>
                    </div>
                    <IconChevron className={styles.cardChevron} aria-hidden />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppPage>
  );
}
