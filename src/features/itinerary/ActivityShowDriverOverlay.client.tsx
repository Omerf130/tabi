"use client";

import { buildTaxiModeContent } from "@/features/accommodations/build-taxi-mode-content";
import type { ActivityViewModel } from "./types";
import styles from "@/features/accommodations/TaxiModeOverlay.module.scss";

type ActivityShowDriverOverlayProps = {
  activity: ActivityViewModel;
  onClose: () => void;
};

export function ActivityShowDriverOverlay({
  activity,
  onClose,
}: ActivityShowDriverOverlayProps) {
  const content = buildTaxiModeContent({
    name: activity.locationName ?? activity.title,
    addressEnglish: activity.address,
  });

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

        {content.primaryAddress ? (
          <p
            className={styles.primaryAddress}
            dir="auto"
            lang={content.primaryAddressLang}
          >
            {content.primaryAddress}
          </p>
        ) : null}

        {content.missingAddressMessage ? (
          <p className={styles.missingAddress} role="status">
            {content.missingAddressMessage}
          </p>
        ) : null}
      </div>

      <button type="button" className={styles.closeButton} onClick={onClose}>
        סגירה
      </button>
    </div>
  );
}
