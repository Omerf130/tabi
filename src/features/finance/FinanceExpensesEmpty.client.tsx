"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconCurrency } from "@/components/ui/icons";
import styles from "./FinancePage.module.scss";

type FinanceExpensesEmptyProps = {
  variant: "expenses" | "categories";
};

export function FinanceExpensesEmpty({ variant }: FinanceExpensesEmptyProps) {
  const t = useTranslations("Finance");

  if (variant === "categories") {
    return (
      <EmptyState
        variant="inline"
        className={styles.financeInlineEmpty}
        visual={{ motif: "generic", icon: <IconCurrency aria-hidden /> }}
        title={t("noCategoriesYet")}
      />
    );
  }

  return (
    <EmptyState
      variant="section"
      visualDensity="compact"
      className={styles.financeSectionEmpty}
      visual={{ motif: "generic", icon: <IconCurrency aria-hidden /> }}
      title={t("noExpensesYet")}
      description={t("noExpensesYetHint")}
    />
  );
}
