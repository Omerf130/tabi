import { formatCurrencyAmount } from "@/features/currency/convert";
import { getExpenseCategoryPresentation } from "./category-presentation";
import { FINANCE_MESSAGES } from "./constants";
import type { FinanceCategoryDonutSegment } from "./types";
import styles from "./FinancePage.module.scss";

type FinanceCategoryDonutProps = {
  segments: readonly FinanceCategoryDonutSegment[];
  totalExpenses: number;
  baseCurrency: string;
};

function buildConicGradient(segments: readonly FinanceCategoryDonutSegment[]): string {
  if (segments.length === 0) {
    return "conic-gradient(#e2e8f0 0 100%)";
  }

  let cumulative = 0;
  const stops: string[] = [];

  for (const segment of segments) {
    const start = cumulative;
    cumulative += segment.percentage;
    stops.push(`${segment.color} ${start}% ${cumulative}%`);
  }

  if (cumulative < 100) {
    stops.push(`#e2e8f0 ${cumulative}% 100%`);
  }

  return `conic-gradient(${stops.join(", ")})`;
}

export function FinanceCategoryDonut({
  segments,
  totalExpenses,
  baseCurrency,
}: FinanceCategoryDonutProps) {
  const summaryText = segments
    .map((segment) => `${segment.label}: ${formatCurrencyAmount(segment.total, baseCurrency)}`)
    .join("; ");

  return (
    <div className={styles.donutLayout}>
      <div
        className={styles.donutChart}
        style={{ background: buildConicGradient(segments) }}
        role="img"
        aria-label={`${FINANCE_MESSAGES.categoriesSectionTitle}. ${summaryText}`}
      >
        <div className={styles.donutCenter}>
          <span className={styles.donutCenterAmount}>
            {formatCurrencyAmount(totalExpenses, baseCurrency)}
          </span>
          <span className={styles.donutCenterLabel}>{FINANCE_MESSAGES.totalExpensesCenter}</span>
        </div>
      </div>

      <ul className={styles.donutLegend} aria-hidden>
        {segments.map((segment) => {
          const Icon = getExpenseCategoryPresentation(segment.category).Icon;
          return (
            <li key={segment.category} className={styles.donutLegendItem}>
              <span
                className={styles.donutLegendSwatch}
                style={{ backgroundColor: segment.color }}
              />
              <span className={styles.donutLegendIconWrap} style={{ color: segment.color }}>
                <Icon className={styles.donutLegendIcon} />
              </span>
              <span className={styles.donutLegendCopy}>
                <span className={styles.donutLegendLabel}>{segment.label}</span>
                <span className={styles.donutLegendAmount}>
                  {formatCurrencyAmount(segment.total, baseCurrency)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
