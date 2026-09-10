import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { AppPage } from "@/features/app-shell/AppPage";
import { GooglePlacesAttribution } from "@/features/places/GooglePlacesAttribution";
import { buildAccommodationTaxiHref } from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import styles from "./AccommodationDetail.module.scss";

type AccommodationDetailContentProps = {
  tripId: string;
  accommodation: AccommodationViewModel;
};

export function AccommodationDetailContent({
  tripId,
  accommodation,
}: AccommodationDetailContentProps) {
  return (
    <AppPage width="content">
      <Card variant="standard">
        <dl className={styles.detailsList}>
          <div className={styles.detailItem}>
            <dt>שם</dt>
            <dd dir="auto">{accommodation.name}</dd>
          </div>
          {accommodation.nameJapanese ? (
            <div className={styles.detailItem}>
              <dt>שם ביפנית</dt>
              <dd dir="auto" lang="ja">
                {accommodation.nameJapanese}
              </dd>
            </div>
          ) : null}
          <div className={styles.detailItem}>
            <dt>עיר</dt>
            <dd>{accommodation.city}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Check-in</dt>
            <dd>{accommodation.checkInLabel}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Check-out</dt>
            <dd>{accommodation.checkOutLabel}</dd>
          </div>
          {accommodation.addressEnglish ? (
            <div className={styles.detailItem}>
              <dt>כתובת באנגלית</dt>
              <dd dir="auto">{accommodation.addressEnglish}</dd>
            </div>
          ) : null}
          {accommodation.addressJapanese ? (
            <div className={styles.detailItem}>
              <dt>כתובת ביפנית</dt>
              <dd dir="auto" lang="ja">
                {accommodation.addressJapanese}
              </dd>
            </div>
          ) : null}
          {accommodation.linkedCost ? (
            <div className={styles.detailItem}>
              <dt>עלות</dt>
              <dd>{accommodation.linkedCost.label}</dd>
            </div>
          ) : null}
          {accommodation.bookingReference ? (
            <div className={styles.detailItem}>
              <dt>מספר הזמנה</dt>
              <dd>{accommodation.bookingReference}</dd>
            </div>
          ) : null}
          {accommodation.notes ? (
            <div className={styles.detailItem}>
              <dt>הערות</dt>
              <dd dir="auto">{accommodation.notes}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <div className={styles.actions}>
        {accommodation.googleMapsUrl ? (
          <a
            href={accommodation.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionLinkSecondary}
          >
            פתח ב-Google Maps
          </a>
        ) : null}
        <Link
          href={buildAccommodationTaxiHref(tripId, accommodation.id)}
          className={styles.actionLinkPrimary}
        >
          הצג לנהג
        </Link>
      </div>
      {accommodation.usesGoogleAttribution ? (
        <GooglePlacesAttribution className={styles.attribution} />
      ) : null}
    </AppPage>
  );
}
