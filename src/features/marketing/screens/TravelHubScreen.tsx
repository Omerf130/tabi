import { TRAVEL_HUB_ITEMS } from "../mock-data";
import styles from "./screens.module.scss";

const TONES = ["violet", "sky", "coral", "sky", "warm", "violet"] as const;

export function TravelHubScreen() {
  return (
    <div className={styles.screenRoot}>
      <span className={styles.appBrand}>Tabi</span>
      <p className={styles.hubTitle}>הטיול שלי</p>
      <div className={styles.hubGrid}>
        {TRAVEL_HUB_ITEMS.map((item, index) => (
          <div
            key={item}
            className={styles.hubTile}
            data-tone={TONES[index % TONES.length]}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
