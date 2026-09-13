"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconChevron, IconCurrency } from "@/components/ui/icons";
import { formatCurrencyAmount } from "@/features/currency/convert";
import { formatAppNumber } from "@/features/i18n/formatting";
import { resolveAppLocale } from "@/features/i18n/locale";
import { useLocale } from "next-intl";
import type { TravelHubFinanceSummary } from "@/features/finance/types";
import styles from "./TravelHub.module.scss";

type FinanceSummaryCardProps = {
  finance: TravelHubFinanceSummary;
};

export function FinanceSummaryCard({ finance }: FinanceSummaryCardProps) {
  const t = useTranslations("Finance");
  const locale = resolveAppLocale(useLocale());
  const progressPercent =
    finance.percentConsumed !== null
      ? Math.min(Math.max(Math.round(finance.percentConsumed), 0), 100)
      : null;

  return (
    <Link href={finance.href} className={styles.financeSummaryCard}>
      <header className={styles.financeSummaryHeader}>
        <span className={styles.financePreviewIconWrap} aria-hidden>
          <IconCurrency className={styles.financePreviewIcon} />
        </span>
        <h2 className={styles.financePreviewTitle}>{t("pageTitle")}</h2>
        <IconChevron className={styles.financeSummaryChevron} aria-hidden />
      </header>

      {!finance.hasExpenses ? (
        <p className={styles.financeSummaryCopy}>{t("hubNoExpenses")}</p>
      ) : (
        <>
          <p className={styles.financeSummaryPrimary}>
            {formatCurrencyAmount(finance.totalExpenses, finance.baseCurrency)}
          </p>
          {finance.hasBudget && finance.budgetAmount !== null ? (
            <>
              <p className={styles.financeSummaryMeta}>
                {t("hubBudgetMeta", {
                  budget: formatCurrencyAmount(finance.budgetAmount, finance.baseCurrency),
                })}
              </p>
              {progressPercent !== null ? (
                <div
                  className={styles.financeSummaryTrack}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t("hubProgressAriaLabel", {
                    title: t("pageTitle"),
                    percent: formatAppNumber(progressPercent, locale),
                  })}
                >
                  <span
                    className={styles.financeSummaryFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.financeSummaryMeta}>{t("totalExpenses")}</p>
          )}
        </>
      )}
    </Link>
  );
}
