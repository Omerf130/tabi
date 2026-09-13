import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge/Badge";
import { IconChevron } from "@/components/ui/icons";
import type { FocusedDayCardViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

type FocusedDayCardProps = {
  card: FocusedDayCardViewModel;
};

export async function FocusedDayCard({ card }: FocusedDayCardProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations("Itinerary"),
    getTranslations("Common"),
  ]);
  const showIndicators = card.transportCount > 0 || card.incompleteReminderCount > 0;

  return (
    <Link
      href={card.href}
      className={styles.focusedDayCard}
      data-temporal={card.temporalState}
      aria-label={t("focusedDayOpenAria", {
        dayNumber: card.dayNumber,
        weekdayLabel: card.weekdayLabel,
        dateLabel: card.dateLabel,
      })}
    >
      <span className={styles.focusedDayMain}>
        <span className={styles.focusedDayIdentity}>
          {card.showTodayBadge ? <Badge tone="accent">{tCommon("today")}</Badge> : null}
          <span className={styles.focusedDayNumber}>
            {tCommon("dayNumber", { dayNumber: card.dayNumber })}
          </span>
          <span className={styles.focusedDayMeta}>
            {card.weekdayLabel}, {card.dateLabel}
          </span>
        </span>

        {card.weather ? (
          <span
            className={styles.focusedWeather}
            aria-label={t("focusedWeatherAria", {
              condition: card.weather.conditionLabel,
              temperature: card.weather.temperatureLabel,
              location: card.weather.locationLabel,
            })}
          >
            {card.weather.conditionIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- WeatherAPI CDN icon
              <img
                src={card.weather.conditionIconUrl}
                alt=""
                className={styles.focusedWeatherIcon}
                width={24}
                height={24}
              />
            ) : null}
            <span className={styles.focusedWeatherText}>
              {card.weather.temperatureLabel} · {card.weather.locationLabel}
            </span>
          </span>
        ) : null}

        {card.accommodationName ? (
          <span className={styles.focusedAccommodation} dir="auto">
            <span className={styles.focusedAccommodationIcon} aria-hidden>
              🏨
            </span>
            {card.accommodationName}
          </span>
        ) : null}

        {card.nextItems.length > 0 ? (
          <span className={styles.focusedNextSection}>
            <span className={styles.focusedNextHeading}>{t("focusedNextHeading")}</span>
            <span className={styles.focusedNextList}>
              {card.nextItems.map((item, index) => (
                <span
                  key={`${item.timeLabel ?? "untimed"}-${item.title}-${index}`}
                  className={styles.focusedNextRow}
                >
                  {item.timeLabel ? (
                    <span className={styles.focusedNextTime}>{item.timeLabel}</span>
                  ) : (
                    <span className={styles.focusedNextTimePlaceholder} aria-hidden />
                  )}
                  <span className={styles.focusedNextTitle} dir="auto">
                    {item.title}
                  </span>
                </span>
              ))}
            </span>
          </span>
        ) : null}

        {showIndicators ? (
          <span className={styles.focusedIndicators}>
            {card.transportCount > 0 ? (
              <span className={styles.focusedIndicator}>
                <span aria-hidden>🚆</span>{" "}
                {tCommon("rideCount", { count: card.transportCount })}
              </span>
            ) : null}
            {card.incompleteReminderCount > 0 ? (
              <span className={styles.focusedIndicator}>
                <span aria-hidden>🔔</span>{" "}
                {tCommon("reminderCount", { count: card.incompleteReminderCount })}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>

      <IconChevron className={styles.focusedDayChevron} aria-hidden />
    </Link>
  );
}
