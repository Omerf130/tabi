import type { TripWorkspace } from "@/features/trips/public-trip";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import {
  getTripSettingsSectionClassName,
  type TripSettingsVariant,
} from "./section-variant";
import styles from "./TripSettingsSections.module.scss";

type TripDetailsSectionProps = {
  trip: TripWorkspace;
  variant?: TripSettingsVariant;
};

export function TripDetailsSection({
  trip,
  variant = "stack",
}: TripDetailsSectionProps) {
  return (
    <section
      className={getTripSettingsSectionClassName(variant)}
      aria-labelledby="trip-details-title"
    >
      <div className={styles.header}>
        <h2 id="trip-details-title" className={styles.title}>
          פרטי הטיול
        </h2>
        <p className={styles.hint}>מידע בסיסי על הטיול. ניהול מלא יתווסף בהמשך.</p>
      </div>
      <dl className={styles.detailsList}>
        <div className={styles.detailItem}>
          <dt>שם הטיול</dt>
          <dd>{trip.name}</dd>
        </div>
        <div className={styles.detailItem}>
          <dt>תאריכים</dt>
          <dd>{formatCalendarDateRangeDisplay(trip.startDate, trip.endDate)}</dd>
        </div>
      </dl>
    </section>
  );
}
