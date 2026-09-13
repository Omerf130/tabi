import { getTranslations } from "next-intl/server";
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

export async function TripDetailsSection({
  trip,
  variant = "stack",
}: TripDetailsSectionProps) {
  const t = await getTranslations("TripSettings");

  return (
    <section
      className={getTripSettingsSectionClassName(variant)}
      aria-labelledby="trip-details-title"
    >
      <div className={styles.header}>
        <h2 id="trip-details-title" className={styles.title}>
          {t("detailsTitle")}
        </h2>
        <p className={styles.hint}>{t("detailsHint")}</p>
      </div>
      <dl className={styles.detailsList}>
        <div className={styles.detailItem}>
          <dt>{t("tripName")}</dt>
          <dd>{trip.name}</dd>
        </div>
        <div className={styles.detailItem}>
          <dt>{t("dates")}</dt>
          <dd>{formatCalendarDateRangeDisplay(trip.startDate, trip.endDate)}</dd>
        </div>
      </dl>
    </section>
  );
}
