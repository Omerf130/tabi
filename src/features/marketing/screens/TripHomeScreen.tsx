import { BARCELONA_TODAY, BARCELONA_TRIP } from "../mock-data";
import styles from "./screens.module.scss";

export function TripHomeScreen() {
  return (
    <div className={styles.screenRoot}>
      <span className={styles.appBrand}>Tabi</span>
      <div className={styles.tripHeader}>
        <p className={styles.tripCity}>{BARCELONA_TRIP.city}</p>
        <p className={styles.tripDates}>{BARCELONA_TRIP.dateRange}</p>
      </div>
      <p className={styles.sectionLabel}>{BARCELONA_TRIP.dayLabel}</p>
      <ul className={styles.activityList}>
        {BARCELONA_TODAY.map((item, index) => (
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
      <span className={styles.weatherChip}>{BARCELONA_TRIP.weather}</span>
    </div>
  );
}
