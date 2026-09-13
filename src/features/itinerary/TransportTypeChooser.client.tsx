"use client";

import { useTranslations } from "next-intl";
import { createTransportTypeSingularLabelResolver } from "@/features/transport/transport-labels";
import { TRANSPORT_TYPES, type TransportType } from "@/features/transport/transport-types";
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
  const t = useTranslations("Activity");
  const tTransport = useTranslations("Transport");
  const typeSingularLabel = createTransportTypeSingularLabelResolver(tTransport);

  return (
    <section className={styles.transportChooser} aria-labelledby="transport-type-heading">
      {showLabel ? (
        <h3 id="transport-type-heading" className={styles.blockLabel}>
          {t("transportType")}
        </h3>
      ) : null}
      <div
        className={styles.transportTileGrid}
        role="radiogroup"
        aria-label={t("transportTypeAria")}
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
                {typeSingularLabel(type)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
