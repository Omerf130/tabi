import { listTripThemeAtmosphereLayers } from "./trip-theme-atmosphere-assets";
import type { TripThemeKey } from "./trip-theme-keys";
import styles from "./TripThemeAtmosphere.module.scss";

type TripThemeAtmosphereProps = {
  themeKey: TripThemeKey;
};

/**
 * Decorative Trip theme atmosphere (S4D). PNG artwork behind workspace content.
 */
export function TripThemeAtmosphere({ themeKey }: TripThemeAtmosphereProps) {
  const layers = listTripThemeAtmosphereLayers(themeKey);
  if (layers.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.root}
      data-atmosphere-theme={themeKey}
      aria-hidden="true"
    >
      {layers.map((layer) => (
        <img
          key={`${themeKey}-${layer.role}`}
          className={styles.layer}
          data-layer={layer.role}
          src={layer.src}
          alt=""
          decoding="async"
          draggable={false}
        />
      ))}
    </div>
  );
}
