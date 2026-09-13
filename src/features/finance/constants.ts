export const DEFAULT_BASE_CURRENCY = "ILS";

export const EXPENSE_SOURCE_TYPES = [
  "activity",
  "accommodation",
  "transport",
  "manual",
] as const;

export const EXPENSE_CATEGORIES = [
  "accommodation",
  "food",
  "transport",
  "activities",
  "shopping",
  "flights",
  "other",
] as const;

export const FINANCE_ERROR_CODES = {
  generic: "generic",
  validationFailed: "validationFailed",
  settingsNotFound: "settingsNotFound",
  budgetRequired: "budgetRequired",
  budgetInvalid: "budgetInvalid",
  baseCurrencyInvalid: "baseCurrencyInvalid",
  baseCurrencyLocked: "baseCurrencyLocked",
  expenseAmountInvalid: "expenseAmountInvalid",
  manualTitleRequired: "manualTitleRequired",
  linkedSourceRequired: "linkedSourceRequired",
  manualSourceIdForbidden: "manualSourceIdForbidden",
  linkedTitleForbidden: "linkedTitleForbidden",
  categoryInvalid: "categoryInvalid",
  sourceTypeInvalid: "sourceTypeInvalid",
  conversionPreviewFailed: "conversionPreviewFailed",
} as const;

export type FinanceErrorCode =
  (typeof FINANCE_ERROR_CODES)[keyof typeof FINANCE_ERROR_CODES];

export const FINANCE_UI_KEYS = {
  deletedSourceFallback: "deletedSourceFallback",
  accommodationFallbackName: "accommodationFallbackName",
  linkedToActivity: "linkedToActivity",
  linkedToAccommodation: "linkedToAccommodation",
  linkedToTransport: "linkedToTransport",
} as const;

export type FinanceUiKey = (typeof FINANCE_UI_KEYS)[keyof typeof FINANCE_UI_KEYS];

export function buildFinanceHref(tripId: string): string {
  return `/app/trips/${tripId}/finance`;
}
