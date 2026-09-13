import Link from "next/link";
import type { TripHomeTodaySummary } from "./types";
import styles from "./TripHomeContent.module.scss";

type DuringTodaySummaryProps = {
  summary: TripHomeTodaySummary;
};

export function DuringTodaySummary({ summary }: DuringTodaySummaryProps) {
  const rows = [
    summary.tonightName
      ? { label: "הלילה", value: summary.tonightName }
      : null,
    summary.weatherLabel
      ? { label: "מזג אוויר", value: summary.weatherLabel, icon: summary.weatherIconUrl }
      : null,
    summary.todayItemCount !== undefined && summary.todayPlanHref
      ? {
          label: "היום במסלול",
          value: `${summary.todayItemCount} פריטים`,
          href: summary.todayPlanHref,
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className={styles.homeSection} aria-label="סיכום היום">
      <div className={styles.homeSectionHeader}>
        <h2 className={styles.homeSectionTitle}>סיכום היום</h2>
      </div>
      <ul className={styles.todaySummaryList}>
        {rows.map((row) => (
          <li key={row.label} className={styles.todaySummaryItem}>
            <span className={styles.todaySummaryLabel}>{row.label}</span>
            {row.href ? (
              <Link href={row.href} className={styles.todaySummaryValueLink}>
                {row.value}
              </Link>
            ) : (
              <span className={styles.todaySummaryValue}>
                {"icon" in row && row.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.icon} alt="" className={styles.todaySummaryWeatherIcon} />
                ) : null}
                {row.value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
