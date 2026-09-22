import { getTranslations } from "next-intl/server";
import type { TripHomeTodaySummary } from "./types";
import styles from "./TripHomeContent.module.scss";

type DuringTodaySummaryProps = {
  summary: TripHomeTodaySummary;
};

type SummaryTile = {
  id: string;
  value: string;
  label: string;
  iconUrl?: string;
};

export async function DuringTodaySummary({ summary }: DuringTodaySummaryProps) {
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  const tiles: SummaryTile[] = [];

  if (summary.tonightName) {
    tiles.push({
      id: "tonight",
      value: summary.tonightName,
      label: t("tonightLabel"),
    });
  }

  if (summary.weatherLabel) {
    tiles.push({
      id: "weather",
      value: summary.weatherLabel,
      label: summary.weatherConditionLabel ?? t("weatherLabel"),
      iconUrl: summary.weatherIconUrl,
    });
  }

  if (summary.activityCount != null && summary.activityCount > 0) {
    tiles.push({
      id: "activities",
      value: String(summary.activityCount),
      label: t("todayActivitiesCountLabel"),
    });
  }

  if (
    summary.tripDayNumber != null &&
    summary.tripDayTotal != null &&
    summary.tripDayTotal > 0
  ) {
    tiles.push({
      id: "trip-day",
      value: tCommon("dayMeta", {
        dayNumber: summary.tripDayNumber,
        totalDays: summary.tripDayTotal,
      }),
      label: t("todayTripDayLabel"),
    });
  }

  if (summary.transportCount != null && summary.transportCount > 0) {
    tiles.push({
      id: "transport",
      value: String(summary.transportCount),
      label: t("todayTransportCountLabel"),
    });
  }

  if (tiles.length === 0) {
    return null;
  }

  return (
    <section className={styles.homeSection} aria-label={t("todaySummaryAria")}>
      <h2 className={styles.homeSectionTitle}>{t("todaySummaryTitle")}</h2>
      <ul className={styles.duringSummaryGrid}>
        {tiles.map((tile) => (
          <li key={tile.id} className={styles.duringSummaryTile}>
            {tile.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tile.iconUrl} alt="" className={styles.duringSummaryIcon} />
            ) : null}
            <span className={styles.duringSummaryValue} dir="auto">
              {tile.value}
            </span>
            <span className={styles.duringSummaryLabel}>{tile.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
