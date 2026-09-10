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
    finance.percentConsumed !== null ? Math.min(Math.max(finance.percentConsumed, 0), 100) : null;

  return (
    <Link href={finance.href} className={styles.financeSummaryCard}>
      <header className={styles.financeSummaryHeader}>
        <span className={styles.financePreviewIconWrap} aria-hidden>
          <IconCurrency className={styles.financePreviewIcon} />
        </span>
        <h3 className={styles.financePreviewTitle}>{FINANCE_PAGE_TITLE}</h3>
        <IconChevron className={styles.financeSummaryChevron} aria-hidden />
      </header>

      {!finance.hasExpenses ? (
        <p className={styles.financeSummaryCopy}>{FINANCE_MESSAGES.hubNoExpenses}</p>
      ) : (
        <>
          <p className={styles.financeSummaryPrimary}>
            {formatCurrencyAmount(finance.totalExpenses, finance.baseCurrency)}
          </p>
          <p className={styles.financeSummaryMeta}>{FINANCE_MESSAGES.totalExpenses}</p>
          {finance.hasBudget && finance.remainingBudget !== null ? (
            <>
              <p className={styles.financeSummarySecondary}>
                {formatCurrencyAmount(finance.remainingBudget, finance.baseCurrency)}{" "}
                {FINANCE_MESSAGES.remaining}
              </p>
              {progressPercent !== null ? (
                <div className={styles.financeSummaryTrack} aria-hidden>
                  <span
                    className={styles.financeSummaryFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Link>
  );
}
