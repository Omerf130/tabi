import { getTranslations } from "next-intl/server";
import type { TripHomeTodaySummary } from "./types";
import styles from "./TripHomeContent.module.scss";

type DuringTodaySummaryProps = {
  summary: TripHomeTodaySummary;
};

export async function DuringTodaySummary({ summary }: DuringTodaySummaryProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Common"),
  ]);

  const items = [
    summary.tonightName
      ? { label: t("tonightLabel"), value: summary.tonightName }
      : null,
    summary.weatherLabel
      ? {
          label: t("weatherLabel"),
          value: summary.weatherLabel,
          icon: summary.weatherIconUrl,
        }
      : null,
    summary.todayItemCount != null
      ? {
          label: t("todayItineraryLabel"),
          value: tCommon("items", { count: summary.todayItemCount }),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item != null);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.homeSection} aria-label={t("todaySummaryAria")}>
      <div className={styles.homeSectionHeader}>
        <h2 className={styles.homeSectionTitle}>{t("todaySummaryTitle")}</h2>
      </div>
      <ul className={styles.duringSummaryGrid}>
        {items.map((item) => (
          <li key={item.label} className={styles.duringSummaryTile}>
            {"icon" in item && item.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.icon} alt="" className={styles.duringSummaryIcon} />
            ) : null}
            <span className={styles.duringSummaryLabel}>{item.label}</span>
            <span className={styles.duringSummaryValue} dir="auto">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
