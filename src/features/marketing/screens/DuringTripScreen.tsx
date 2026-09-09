import { DURING_ITEMS } from "../mock-data";
import styles from "./screens.module.scss";

export function DuringTripScreen() {
  return (
    <div className={styles.screenRoot}>
      <span className={styles.appBrand}>Tabi</span>
      <p className={styles.sectionLabel}>במהלך הטיול</p>
      <div className={styles.nowBlock}>
        <p className={styles.nowLabel}>עכשיו</p>
        <div className={styles.activityItem} data-highlight="true">
          <span className={styles.activityTime}>{DURING_ITEMS.now.time}</span>
          <span className={styles.activityTitle}>{DURING_ITEMS.now.title}</span>
        </div>
        <p className={`${styles.nowLabel} ${styles.nowLabelSpaced}`}>הבא בתור</p>
        <div className={styles.activityItem}>
          <span className={styles.activityTime}>{DURING_ITEMS.next.time}</span>
          <span className={styles.activityTitle}>{DURING_ITEMS.next.title}</span>
        </div>
      </div>
      <div className={styles.toolRow}>
        {DURING_ITEMS.tools.map((tool) => (
          <span key={tool.label} className={styles.toolChip}>
            {tool.label} <strong>{tool.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
