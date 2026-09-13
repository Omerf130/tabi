import { getTranslations } from "next-intl/server";
import type { ItineraryDayHeaderViewModel } from "./types";
import styles from "./ItineraryExperience.module.scss";

type ItineraryDayHeaderProps = {
  header: ItineraryDayHeaderViewModel;
};

export async function ItineraryDayHeader({ header }: ItineraryDayHeaderProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations("Itinerary"),
    getTranslations("Common"),
  ]);
  const contextLine = [header.locationLabel, header.weather?.temperatureLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className={styles.dayHeader}>
      <div className={styles.dayHeaderMain}>
        <h2 className={styles.dayHeaderNumber}>
          {tCommon("dayNumber", { dayNumber: header.dayNumber })}
        </h2>
        <p className={styles.dayHeaderMeta}>
          {header.weekdayLabel}, {header.dateLabel}
          {header.isToday ? (
            <span className={styles.dayHeaderToday}>{t("dayHeaderToday")}</span>
          ) : null}
        </p>
        {contextLine ? (
          <p className={styles.dayHeaderContext}>{contextLine}</p>
        ) : null}
        {header.weather?.conditionLabel ? (
          <p className={styles.dayHeaderWeather}>{header.weather.conditionLabel}</p>
        ) : null}
        {header.accommodationContext ? (
          <p className={styles.dayHeaderAccommodation}>{header.accommodationContext}</p>
        ) : null}
      </div>
    </header>
  );
}
