"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconChevron, IconCurrency } from "@/components/ui/icons";
import { formatCurrencyAmount } from "@/features/currency/convert";
import type { AfterTripFinanceRecapViewModel } from "@/features/finance/types";
import styles from "./TripHomeContent.module.scss";

type AfterTripFinanceRecapProps = {
  recap: AfterTripFinanceRecapViewModel;
};

export function AfterTripFinanceRecap({ recap }: AfterTripFinanceRecapProps) {
  const t = useTranslations("Finance");

  if (recap.variant === "noExpenses") {
    return (
      <Link href={recap.href} className={styles.afterFinanceCompact}>
        <span className={styles.afterFinanceCompactIconWrap} aria-hidden>
          <IconCurrency className={styles.afterFinanceCompactIcon} />
        </span>
        <span className={styles.afterFinanceCompactCopy}>
          <span className={styles.afterFinanceCompactTitle}>{recap.title}</span>
          <span className={styles.afterFinanceCompactMessage}>{recap.message}</span>
        </span>
        <span className={styles.afterFinanceCompactCta}>{recap.ctaLabel}</span>
        <IconChevron className={styles.afterEntryChevron} aria-hidden />
      </Link>
    );
  }

  return (
    <article className={styles.afterFinanceRecap} aria-label={recap.title}>
      <header className={styles.afterFinanceRecapHeader}>
        <span className={styles.afterFinanceRecapIconWrap} aria-hidden>
          <IconCurrency className={styles.afterFinanceRecapIcon} />
        </span>
        <h2 className={styles.afterFinanceRecapTitle}>{recap.title}</h2>
      </header>

      <div className={styles.afterFinanceRecapStats}>
        <div className={styles.afterFinanceRecapStat}>
          <span className={styles.afterFinanceRecapStatValue}>{recap.totalExpensesLabel}</span>
          <span className={styles.afterFinanceRecapStatLabel}>
            {t("totalExpenses")}
          </span>
        </div>
        {recap.hasBudget && recap.budgetLabel ? (
          <div className={styles.afterFinanceRecapStat}>
            <span className={styles.afterFinanceRecapStatValue}>{recap.budgetLabel}</span>
            <span className={styles.afterFinanceRecapStatLabel}>
              {t("totalBudget")}
            </span>
          </div>
        ) : null}
        {recap.hasBudget && recap.remainingLabel && recap.remainingHeading ? (
          <div className={styles.afterFinanceRecapStat}>
            <span
              className={styles.afterFinanceRecapStatValue}
              data-over={recap.isOverBudget ? "true" : "false"}
            >
              {recap.remainingLabel}
            </span>
            <span className={styles.afterFinanceRecapStatLabel}>
              {t(recap.remainingHeading)}
            </span>
          </div>
        ) : null}
      </div>

      {recap.categoryBars.length > 0 ? (
        <div className={styles.afterFinanceCategories}>
          <div
            className={styles.afterFinanceBarTrack}
            aria-hidden
            role="presentation"
          >
            {recap.categoryBars.map((bar) => (
              <span
                key={bar.category}
                className={styles.afterFinanceBarSegment}
                style={{
                  width: `${bar.percentage}%`,
                  backgroundColor: bar.color,
                }}
              />
            ))}
          </div>
          <ul className={styles.afterFinanceLegend}>
            {recap.categoryBars.map((bar) => (
              <li key={bar.category} className={styles.afterFinanceLegendItem}>
                <span
                  className={styles.afterFinanceLegendSwatch}
                  style={{ backgroundColor: bar.color }}
                />
                <span className={styles.afterFinanceLegendLabel}>{bar.label}</span>
                <span className={styles.afterFinanceLegendAmount}>
                  {formatCurrencyAmount(bar.total, recap.baseCurrency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link href={recap.href} className={styles.afterFinanceRecapCta}>
        {recap.ctaLabel}
        <IconChevron className={styles.afterFinanceRecapCtaChevron} aria-hidden />
      </Link>
    </article>
  );
}
