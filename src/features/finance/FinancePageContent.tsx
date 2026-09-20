"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { IconBack, IconCurrency } from "@/components/ui/icons";
import { formatAppNumber } from "@/features/i18n/formatting";
import { useLocale } from "next-intl";
import { resolveAppLocale } from "@/features/i18n/locale";
import { formatCurrencyAmount } from "@/features/currency/convert";
import { FinanceExpensesEmpty } from "./FinanceExpensesEmpty.client";
import { FinanceCategoryDonut } from "./FinanceCategoryDonut";
import { FinanceExpenseList } from "./FinanceExpenseList";
import { FinanceExpenseSheet } from "./FinanceExpenseSheet.client";
import { FinanceSettingsSheet } from "./FinanceSettingsSheet.client";
import type { ExpenseRowViewModel, FinancePageViewModel } from "./types";
import styles from "./FinancePage.module.scss";

type FinanceView = "home" | "all";

type FinancePageContentProps = FinancePageViewModel & {
  initialSettingsOpen?: boolean;
};

export function FinancePageContent({
  initialSettingsOpen = false,
  ...model
}: FinancePageContentProps) {
  const t = useTranslations("Finance");
  const locale = resolveAppLocale(useLocale());
  const [view, setView] = useState<FinanceView>("home");
  const [settingsOpen, setSettingsOpen] = useState(initialSettingsOpen);
  const [expenseSheet, setExpenseSheet] = useState<"create" | ExpenseRowViewModel | null>(
    null,
  );

  const { summary, settings, hero, pageState } = model;
  const budgetCtaLabel =
    settings.budgetAmount === null ? t("setBudgetCta") : t("editBudgetCta");

  const progressPercent =
    summary.percentConsumed !== null ? Math.max(0, summary.percentConsumed) : null;

  const visibleRows = view === "all" ? model.expenseRows : model.recentExpenseRows;

  return (
    <div className={styles.finance}>
      <section className={styles.hero} aria-label={hero.title}>
        <Link href={`/app/trips/${model.tripId}/more`} className={styles.heroBack}>
          <IconBack className={styles.heroBackIcon} />
          <span className={styles.srOnly}>{t("backToMore")}</span>
        </Link>

        <div className={styles.heroMedia} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.heroImageSrc} alt="" className={styles.heroImage} />
          <div className={styles.heroScrim} />
        </div>

        <div className={styles.heroBody}>
          <p className={styles.heroTripMeta}>
            {hero.tripName} · {hero.dateRangeLabel}
          </p>
          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
        </div>
      </section>

      <div className={styles.surface}>
        <div className={styles.mainGrid}>
          <section className={styles.budgetCard} aria-label={t("budgetSummaryAriaLabel")}>
            <header className={styles.budgetCardHeader}>
              <span className={styles.budgetCardIconWrap} aria-hidden>
                <IconCurrency className={styles.budgetCardIcon} />
              </span>
              <h2 className={styles.budgetCardTitle}>{t("tripBudgetTitle")}</h2>
              {model.isOwner ? (
                <button
                  type="button"
                  className={styles.budgetEditButton}
                  onClick={() => setSettingsOpen(true)}
                >
                  {budgetCtaLabel}
                </button>
              ) : null}
            </header>

            {pageState === "withBudget" ? (
              <>
                <p className={styles.budgetPrimary}>
                  {formatCurrencyAmount(summary.budgetAmount ?? 0, summary.baseCurrency)}
                </p>
                {progressPercent !== null ? (
                  <div className={styles.progressTrack} aria-hidden>
                    <span
                      className={styles.progressFill}
                      data-over={model.isOverBudget ? "true" : "false"}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                ) : null}
                <div className={styles.budgetStats}>
                  <div className={styles.budgetStat}>
                    <span className={styles.budgetStatValue}>
                      {formatCurrencyAmount(summary.totalExpenses, summary.baseCurrency)}
                    </span>
                    <span className={styles.budgetStatLabel}>{t("spent")}</span>
                  </div>
                  <div className={styles.budgetStat}>
                    <span
                      className={styles.budgetStatValue}
                      data-over={model.isOverBudget ? "true" : "false"}
                    >
                      {formatCurrencyAmount(summary.remainingBudget ?? 0, summary.baseCurrency)}
                    </span>
                    <span className={styles.budgetStatLabel}>
                      {model.isOverBudget ? t("overBudgetShort") : t("remaining")}
                    </span>
                  </div>
                  <div className={styles.budgetStat}>
                    <span className={styles.budgetStatValue}>
                      {summary.percentConsumed !== null
                        ? `${formatAppNumber(Math.round(summary.percentConsumed), locale)}%`
                        : "—"}
                    </span>
                    <span className={styles.budgetStatLabel}>{t("percentConsumed")}</span>
                  </div>
                </div>
                {model.isOverBudget ? (
                  <p className={styles.overBudgetNotice}>{t("overBudget")}</p>
                ) : null}
              </>
            ) : (
              <>
                {model.hasExpenses ? (
                  <p className={styles.budgetPrimary}>
                    {formatCurrencyAmount(summary.totalExpenses, summary.baseCurrency)}
                  </p>
                ) : (
                  <p className={styles.budgetPrimaryMuted}>{t("noExpensesYet")}</p>
                )}
                <p className={styles.budgetSecondary}>{t("totalExpenses")}</p>
                {model.isOwner ? (
                  <button
                    type="button"
                    className={styles.budgetInlineAction}
                    onClick={() => setSettingsOpen(true)}
                  >
                    {t("setBudgetCta")}
                  </button>
                ) : (
                  <p className={styles.memberNotice}>{t("memberNoBudget")}</p>
                )}
              </>
            )}
          </section>

          <section className={styles.categoriesCard} aria-labelledby="finance-categories-title">
            <div className={styles.sectionHeader}>
              <h2 id="finance-categories-title" className={styles.sectionTitle}>
                {t("categoriesSectionTitle")}
              </h2>
            </div>

            {model.donutSegments.length > 0 ? (
              <FinanceCategoryDonut
                segments={model.donutSegments}
                totalExpenses={summary.totalExpenses}
                baseCurrency={summary.baseCurrency}
              />
            ) : (
              <FinanceExpensesEmpty variant="categories" />
            )}
          </section>
        </div>

        <section className={styles.expensesSection} aria-labelledby="finance-expenses-title">
          <div className={styles.sectionHeader}>
            <h2 id="finance-expenses-title" className={styles.sectionTitle}>
              {view === "all" ? t("allSectionTitle") : t("recentSectionTitle")}
            </h2>
            {model.expenseRows.length > model.recentExpenseRows.length ? (
              <button
                type="button"
                className={styles.sectionAction}
                onClick={() => setView(view === "all" ? "home" : "all")}
              >
                {view === "all" ? t("showRecent") : t("showAll")}
              </button>
            ) : null}
          </div>

          {visibleRows.length > 0 ? (
            <FinanceExpenseList
              rows={visibleRows}
              isOwner={model.isOwner}
              onEdit={(expenseId) => {
                const row = model.expenseRows.find((entry) => entry.id === expenseId);
                if (row) {
                  setExpenseSheet(row);
                }
              }}
            />
          ) : (
            <FinanceExpensesEmpty variant="expenses" />
          )}
        </section>

        {model.isOwner ? (
          <div className={styles.addExpenseBar}>
            <Button type="button" className={styles.addExpenseButton} onClick={() => setExpenseSheet("create")}>
              + {t("addExpense")}
            </Button>
          </div>
        ) : null}
      </div>

      {settingsOpen && model.isOwner ? (
        <FinanceSettingsSheet
          tripId={model.tripId}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}

      {expenseSheet ? (
        <FinanceExpenseSheet
          tripId={model.tripId}
          baseCurrency={summary.baseCurrency}
          currencies={model.currencies}
          expense={expenseSheet === "create" ? undefined : expenseSheet}
          onClose={() => setExpenseSheet(null)}
        />
      ) : null}
    </div>
  );
}
