"use client";

import Link from "next/link";
import { buildTaxiModeContent } from "@/features/accommodations/build-taxi-mode-content";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import styles from "./TaxiModeOverlay.module.scss";

type TaxiModeOverlayProps = {
  tripId: string;
  accommodation: AccommodationViewModel;
};

export function TaxiModeOverlay({
  tripId,
  accommodation,
}: TaxiModeOverlayProps) {
  const content = buildTaxiModeContent(accommodation);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.content}>
        <p
          className={styles.primaryName}
          dir="auto"
          lang={content.primaryNameLang}
        >
          {content.primaryName}
        </p>

        {content.secondaryName ? (
          <p className={styles.secondaryName} dir="auto">
            {content.secondaryName}
          </p>
        ) : null}

        {content.primaryAddress ? (
          <p
            className={styles.primaryAddress}
            dir="auto"
            lang={content.primaryAddressLang}
          >
            {content.primaryAddress}
          </p>
        ) : null}

        {content.secondaryAddress ? (
          <p className={styles.secondaryAddress} dir="auto">
            {content.secondaryAddress}
          </p>
        ) : null}

        {content.missingAddressMessage ? (
          <p className={styles.missingAddress} role="status">
            {content.missingAddressMessage}
          </p>
        ) : null}
      </div>

      <Link
        href={`/app/trips/${tripId}/accommodations/${accommodation.id}`}
        className={styles.closeButton}
      >
        סגירה
      </Link>
    </div>
  );
}
