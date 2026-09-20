import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card/Card";
import { AppPage } from "@/features/app-shell/AppPage";
import { GooglePlacesAttribution } from "@/features/places/GooglePlacesAttribution";
import { buildAccommodationTaxiHref } from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import {
  resolveAccommodationLocalFieldLang,
  resolveAccommodationLocalFieldMessageKeys,
} from "./accommodation-local-field-labels";
import styles from "./AccommodationDetail.module.scss";

type AccommodationDetailContentProps = {
  tripId: string;
  accommodation: AccommodationViewModel;
  mapsNavigationHref?: string;
  destinationCountryCode?: string | null;
};

export async function AccommodationDetailContent({
  tripId,
  accommodation,
  mapsNavigationHref,
  destinationCountryCode,
}: AccommodationDetailContentProps) {
  const t = await getTranslations("Accommodation");
  const localFieldKeys = resolveAccommodationLocalFieldMessageKeys(destinationCountryCode);
  const localLang = resolveAccommodationLocalFieldLang(destinationCountryCode);

  return (
    <AppPage width="content">
      <Card variant="standard">
        <dl className={styles.detailsList}>
          <div className={styles.detailItem}>
            <dt>{t("name")}</dt>
            <dd dir="auto">{accommodation.name}</dd>
          </div>
          {accommodation.nameJapanese ? (
            <div className={styles.detailItem}>
              <dt>{t(localFieldKeys.nameLabelKey)}</dt>
              <dd dir="auto" lang={localLang}>
                {accommodation.nameJapanese}
              </dd>
            </div>
          ) : null}
          <div className={styles.detailItem}>
            <dt>{t("city")}</dt>
            <dd>{accommodation.city}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>{t("checkIn")}</dt>
            <dd>{accommodation.checkInLabel}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>{t("checkOut")}</dt>
            <dd>{accommodation.checkOutLabel}</dd>
          </div>
          {accommodation.addressEnglish ? (
            <div className={styles.detailItem}>
              <dt>{t("addressEnglish")}</dt>
              <dd dir="auto">{accommodation.addressEnglish}</dd>
            </div>
          ) : null}
          {accommodation.addressJapanese ? (
            <div className={styles.detailItem}>
              <dt>{t(localFieldKeys.addressLabelKey)}</dt>
              <dd dir="auto" lang={localLang}>
                {accommodation.addressJapanese}
              </dd>
            </div>
          ) : null}
          {accommodation.linkedCost ? (
            <div className={styles.detailItem}>
              <dt>{t("cost")}</dt>
              <dd>{accommodation.linkedCost.label}</dd>
            </div>
          ) : null}
          {accommodation.bookingReference ? (
            <div className={styles.detailItem}>
              <dt>{t("bookingReference")}</dt>
              <dd>{accommodation.bookingReference}</dd>
            </div>
          ) : null}
          {accommodation.notes ? (
            <div className={styles.detailItem}>
              <dt>{t("notes")}</dt>
              <dd dir="auto">{accommodation.notes}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <div className={styles.actions}>
        {mapsNavigationHref ? (
          <a
            href={mapsNavigationHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionLinkSecondary}
          >
            {t("openInMaps")}
          </a>
        ) : null}
        <Link
          href={buildAccommodationTaxiHref(tripId, accommodation.id)}
          className={styles.actionLinkPrimary}
        >
          {t("showDriver")}
        </Link>
      </div>
      {accommodation.usesGoogleAttribution ? (
        <GooglePlacesAttribution className={styles.attribution} />
      ) : null}
    </AppPage>
  );
}
