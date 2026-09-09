import { PLANNING_ITEMS } from "../mock-data";
import styles from "./screens.module.scss";

export function PlanningScreen() {
  return (
    <div className={styles.screenRoot}>
      <span className={styles.appBrand}>Tabi</span>
      <p className={styles.sectionLabel}>לפני הטיול</p>
      <p className={styles.hubTitle}>הכנה ותכנון</p>
      <ul className={styles.planList}>
        {PLANNING_ITEMS.map((item) => (
          <li key={item.label} className={styles.planItem}>
            <span className={styles.planLabel}>{item.label}</span>
            <span className={styles.planDetail}>{item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
