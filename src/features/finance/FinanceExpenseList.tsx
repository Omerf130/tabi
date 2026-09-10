import { IconChevron } from "@/components/ui/icons";
import { getExpenseCategoryPresentation } from "./category-presentation";
import type { ExpenseRowViewModel } from "./types";
import styles from "./FinancePage.module.scss";

type FinanceExpenseListProps = {
  rows: readonly ExpenseRowViewModel[];
  isOwner: boolean;
  onEdit?: (expenseId: string) => void;
};

export function FinanceExpenseList({
  rows,
  isOwner,
  onEdit,
}: FinanceExpenseListProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <ul className={styles.expenseList}>
      {rows.map((row) => {
        const Icon = getExpenseCategoryPresentation(row.category).Icon;
        const content = (
          <>
            <span
              className={styles.expenseIconWrap}
              style={{ backgroundColor: row.categorySoftColor, color: row.categoryColor }}
              aria-hidden
            >
              <Icon className={styles.expenseIcon} />
            </span>
            <span className={styles.expenseCopy}>
              <span className={styles.expenseTitle}>{row.title}</span>
              <span className={styles.expenseMeta}>
                {row.categoryLabel} · {row.expenseDateLabel}
              </span>
            </span>
            <span className={styles.expenseAmounts}>
              <span className={styles.expenseOriginal}>{row.originalAmountLabel}</span>
              {row.showBaseEquivalent ? (
                <span className={styles.expenseBase}>({row.baseAmountLabel})</span>
              ) : null}
            </span>
            {isOwner ? (
              <IconChevron className={styles.expenseChevron} aria-hidden />
            ) : null}
          </>
        );

        if (isOwner && onEdit) {
          return (
            <li key={row.id}>
              <button
                type="button"
                className={styles.expenseRowButton}
                onClick={() => onEdit(row.id)}
              >
                {content}
              </button>
            </li>
          );
        }

        return (
          <li key={row.id} className={styles.expenseRowStatic}>
            {content}
          </li>
        );
      })}
    </ul>
  );
}
