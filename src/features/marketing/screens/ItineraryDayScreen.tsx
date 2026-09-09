import { ROME_DAY } from "../mock-data";
import styles from "./screens.module.scss";

export function ItineraryDayScreen() {
  return (
    <div className={styles.screenRoot}>
      <span className={styles.appBrand}>Tabi</span>
      <span className={styles.dayBadge}>
        {ROME_DAY.day} · {ROME_DAY.city}
      </span>
      <ul className={styles.activityList}>
        {ROME_DAY.items.map((item, index) => (
          <li
            key={item.time}
            className={styles.activityItem}
            data-highlight={index === 0 ? "true" : undefined}
          >
            <span className={styles.activityTime}>{item.time}</span>
            <span className={styles.activityTitle}>{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
