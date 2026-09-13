import Link from "next/link";
import { IconChevron, IconCurrency } from "@/components/ui/icons";
import { formatCurrencyAmount } from "@/features/currency/convert";
import { FINANCE_MESSAGES, FINANCE_PAGE_TITLE } from "@/features/finance/constants";
import type { TravelHubFinanceSummary } from "@/features/finance/types";
import styles from "./TravelHub.module.scss";

type FinanceSummaryCardProps = {
  finance: TravelHubFinanceSummary;
};

export function FinanceSummaryCard({ finance }: FinanceSummaryCardProps) {
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
        <h2 className={styles.financePreviewTitle}>{FINANCE_PAGE_TITLE}</h2>
        <IconChevron className={styles.financeSummaryChevron} aria-hidden />
      </header>

      {!finance.hasExpenses ? (
        <p className={styles.financeSummaryCopy}>{FINANCE_MESSAGES.hubNoExpenses}</p>
      ) : (
        <>
          <p className={styles.financeSummaryPrimary}>
            {formatCurrencyAmount(finance.totalExpenses, finance.baseCurrency)}
          </p>
          {finance.hasBudget && finance.budgetAmount !== null ? (
            <>
              <p className={styles.financeSummaryMeta}>
                מתוך {formatCurrencyAmount(finance.budgetAmount, finance.baseCurrency)} תקציב
              </p>
              {progressPercent !== null ? (
                <div
                  className={styles.financeSummaryTrack}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${FINANCE_PAGE_TITLE}: ${progressPercent}% נוצל`}
                >
                  <span
                    className={styles.financeSummaryFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.financeSummaryMeta}>{FINANCE_MESSAGES.totalExpenses}</p>
          )}
        </>
      )}
    </Link>
  );
}
