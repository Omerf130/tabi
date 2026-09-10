import type { ItineraryDayHeaderViewModel } from "./types";
import styles from "./ItineraryExperience.module.scss";

type ItineraryDayHeaderProps = {
  header: ItineraryDayHeaderViewModel;
};

export function ItineraryDayHeader({ header }: ItineraryDayHeaderProps) {
  const contextLine = [header.locationLabel, header.weather?.temperatureLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className={styles.dayHeader}>
      <div className={styles.dayHeaderMain}>
        <h2 className={styles.dayHeaderNumber}>יום {header.dayNumber}</h2>
        <p className={styles.dayHeaderMeta}>
          {header.weekdayLabel}, {header.dateLabel}
          {header.isToday ? (
            <span className={styles.dayHeaderToday}> · היום</span>
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
