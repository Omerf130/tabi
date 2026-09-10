import type { CurrencyOption } from "@/features/currency/types";
import type { EXPENSE_CATEGORIES, EXPENSE_SOURCE_TYPES } from "./constants";

export type {
  AfterTripFinanceCategoryBar,
  AfterTripFinanceRecapNoExpenses,
  AfterTripFinanceRecapViewModel,
  AfterTripFinanceRecapWithExpenses,
} from "./build-after-trip-finance-recap";

export type ExpenseSourceType = (typeof EXPENSE_SOURCE_TYPES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type TripFinanceSettingsRecord = {
  _id: { toString(): string };
  tripId: { toString(): string };
  baseCurrency: string;
  budgetAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TripExpenseRecord = {
  _id: { toString(): string };
  tripId: { toString(): string };
  sourceType: ExpenseSourceType;
  sourceId?: { toString(): string } | null;
  category: ExpenseCategory;
  title?: string | null;
  originalAmount: number;
  originalCurrency: string;
  baseAmount: number;
  baseCurrency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  expenseDate: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicTripFinanceSettings = {
  id: string;
  tripId: string;
  baseCurrency: string;
  budgetAmount: number | null;
};

export type PublicTripExpense = {
  id: string;
  tripId: string;
  sourceType: ExpenseSourceType;
  sourceId: string | null;
  category: ExpenseCategory;
  title: string | null;
  originalAmount: number;
  originalCurrency: string;
  baseAmount: number;
  baseCurrency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  expenseDate: string;
  notes: string | null;
  createdAt: string;
};

export type FinanceCategoryTotal = {
  category: ExpenseCategory;
  label: string;
  total: number;
};

export type FinanceSummary = {
  baseCurrency: string;
  budgetAmount: number | null;
  totalExpenses: number;
  remainingBudget: number | null;
  percentConsumed: number | null;
  byCategory: FinanceCategoryTotal[];
  recentExpenses: PublicTripExpense[];
};

export type FinancePageState = "noBudgetNoExpenses" | "noBudgetWithExpenses" | "withBudget";

export type FinanceHeroViewModel = {
  heroImageSrc: string;
  tripName: string;
  dateRangeLabel: string;
  title: string;
  subtitle: string;
};

export type EntityLinkedCostViewModel = {
  amount: number;
  currency: string;
  category: ExpenseCategory;
  label: string;
};

export type ExpenseRowViewModel = {
  id: string;
  title: string;
  category: ExpenseCategory;
  categoryLabel: string;
  categoryColor: string;
  categorySoftColor: string;
  expenseDateLabel: string;
  originalAmountLabel: string;
  baseAmountLabel: string;
  showBaseEquivalent: boolean;
  notes: string | null;
  expenseDate: string;
  originalAmount: number;
  originalCurrency: string;
  sourceType: ExpenseSourceType;
  sourceId: string | null;
  isLinked: boolean;
  linkedSourceLabel: string | null;
  categoryEditable: boolean;
};

export type FinanceCategoryDonutSegment = {
  category: ExpenseCategory;
  label: string;
  total: number;
  color: string;
  percentage: number;
};

export type FinancePageViewModel = {
  tripId: string;
  isOwner: boolean;
  pageState: FinancePageState;
  hero: FinanceHeroViewModel;
  settings: PublicTripFinanceSettings;
  summary: FinanceSummary;
  hasExpenses: boolean;
  baseCurrencyLocked: boolean;
  currencies: readonly CurrencyOption[];
  expenseRows: ExpenseRowViewModel[];
  recentExpenseRows: ExpenseRowViewModel[];
  donutSegments: FinanceCategoryDonutSegment[];
  isOverBudget: boolean;
};

export type TravelHubFinanceSummary = {
  href: string;
  hasBudget: boolean;
  hasExpenses: boolean;
  baseCurrency: string;
  totalExpenses: number;
  budgetAmount: number | null;
  remainingBudget: number | null;
  percentConsumed: number | null;
};
