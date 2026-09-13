import { createAppTranslator } from "@/features/i18n/create-app-translator";
import type { AppLocale } from "@/features/i18n/locale";
import type { ExpenseCategory, ExpenseSourceType } from "./types";
import { FINANCE_UI_KEYS, type FinanceUiKey } from "./constants";

export type FinanceCategoryLabelResolver = (category: ExpenseCategory) => string;

export type FinanceLabels = {
  pageTitle: string;
  heroSubtitle: string;
  afterRecapTitle: string;
  afterNoExpenses: string;
  afterOpenFinanceCta: string;
  afterFullFinanceCta: string;
  remaining: string;
  overBudgetShort: string;
  getCategoryLabel: FinanceCategoryLabelResolver;
  resolveUiText: (key: FinanceUiKey) => string;
  resolveLinkedSourceLabel: (
    sourceType: ExpenseSourceType,
  ) => string | null;
};

type FinanceTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function createFinanceLabels(
  t: FinanceTranslator,
  tCategories: FinanceCategoryLabelResolver,
): FinanceLabels {
  return {
    pageTitle: t("pageTitle"),
    heroSubtitle: t("heroSubtitle"),
    afterRecapTitle: t("afterRecapTitle"),
    afterNoExpenses: t("afterNoExpenses"),
    afterOpenFinanceCta: t("afterOpenFinanceCta"),
    afterFullFinanceCta: t("afterFullFinanceCta"),
    remaining: t("remaining"),
    overBudgetShort: t("overBudgetShort"),
    getCategoryLabel: (category) => tCategories(category),
    resolveUiText: (key) => t(key),
    resolveLinkedSourceLabel: (sourceType) => {
      switch (sourceType) {
        case "activity":
          return t(FINANCE_UI_KEYS.linkedToActivity);
        case "accommodation":
          return t(FINANCE_UI_KEYS.linkedToAccommodation);
        case "transport":
          return t(FINANCE_UI_KEYS.linkedToTransport);
        default:
          return null;
      }
    },
  };
}

export function createTestFinanceLabels(locale: AppLocale = "he"): FinanceLabels {
  const t = createAppTranslator("Finance", locale);
  return createFinanceLabels(
    (key, values) => t(key as "pageTitle", values),
    (category) => t(`categories.${category}` as "categories.accommodation"),
  );
}
