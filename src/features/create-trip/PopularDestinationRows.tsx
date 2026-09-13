import Image from "next/image";
import {
  POPULAR_DESTINATIONS,
  type PopularDestinationPreset,
} from "./popular-destinations";

import styles from "./CreateTripWizard.module.scss";

type PopularDestinationRowsProps = {
  loadingId: string | null;
  selectedDestinationId: string | null;
  onSelect: (preset: PopularDestinationPreset) => void;
};

export function PopularDestinationRows({
  loadingId,
  selectedDestinationId,
  onSelect,
}: PopularDestinationRowsProps) {
  return (
    <div className={styles.popularSection}>
      {POPULAR_DESTINATIONS.map((preset) => {
        const isSelected = selectedDestinationId === preset.id;
        const isLoading = loadingId === preset.id;

        return (
          <button
            key={preset.id}
            type="button"
            className={styles.popularRow}
            data-selected={isSelected ? "true" : undefined}
            disabled={Boolean(loadingId)}
            aria-pressed={isSelected}
            onClick={() => onSelect(preset)}
          >
            <span className={styles.popularRowMedia}>
              <Image
                src={preset.imageSrc}
                alt=""
                fill
                sizes="(min-width: 1024px) 420px, 100vw"
                className={styles.popularRowImage}
              />
              <span className={styles.popularRowOverlay} />
              <span className={styles.popularRowCopy}>
                <span className={styles.popularRowName}>{preset.label}</span>
                <span className={styles.popularRowCategory}>{preset.categoryLabel}</span>
              </span>
              <span className={styles.popularRowChevron} aria-hidden="true">
                {isLoading ? "…" : "›"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
