"use client";

import {
  TRANSPORT_TYPES,
  TRANSPORT_TYPE_SINGULAR_LABELS,
  type TransportType,
} from "@/features/transport/transport-types";
import { TRANSPORT_TYPE_ICONS } from "./transport-type-icons";
import styles from "./AddItemFlow.module.scss";

type TransportTypeChooserProps = {
  onSelect: (transportType: TransportType) => void;
  selectedType?: TransportType;
  showLabel?: boolean;
};

export function TransportTypeChooser({
  onSelect,
  selectedType,
  showLabel = true,
}: TransportTypeChooserProps) {
  return (
    <section className={styles.transportChooser} aria-labelledby="transport-type-heading">
      {showLabel ? (
        <h3 id="transport-type-heading" className={styles.blockLabel}>
          סוג תחבורה
        </h3>
      ) : null}
      <div
        className={styles.transportTileGrid}
        role="radiogroup"
        aria-label="סוג תחבורה"
      >
        {TRANSPORT_TYPES.map((type) => {
          const Icon = TRANSPORT_TYPE_ICONS[type];
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              className={styles.transportTile}
              data-selected={isSelected ? "true" : "false"}
              aria-pressed={isSelected}
              onClick={() => onSelect(type)}
            >
              <span className={styles.transportTileIcon} aria-hidden>
                <Icon />
              </span>
              <span className={styles.transportTileLabel}>
                {TRANSPORT_TYPE_SINGULAR_LABELS[type]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
