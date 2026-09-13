import { FINANCE_ERROR_CODES, type FinanceErrorCode } from "./constants";
import type { ExpenseCategory, ExpenseSourceType } from "./types";

export class TripExpenseValidationError extends Error {
  readonly code: FinanceErrorCode;

  constructor(code: FinanceErrorCode) {
    super(code);
    this.code = code;
    this.name = "TripExpenseValidationError";
  }
}

export type TripExpenseInvariantInput = {
  sourceType: ExpenseSourceType;
  sourceId?: string | null;
  title?: string | null;
  originalAmount: number;
  category: ExpenseCategory;
};

export function validateTripExpenseInvariants(
  input: TripExpenseInvariantInput,
): void {
  if (!Number.isFinite(input.originalAmount) || input.originalAmount <= 0) {
    throw new TripExpenseValidationError(FINANCE_ERROR_CODES.expenseAmountInvalid);
  }

  if (input.sourceType === "manual") {
    if (input.sourceId) {
      throw new TripExpenseValidationError(FINANCE_ERROR_CODES.manualSourceIdForbidden);
    }
    if (!input.title?.trim()) {
      throw new TripExpenseValidationError(FINANCE_ERROR_CODES.manualTitleRequired);
    }
    return;
  }

  if (!input.sourceId?.trim()) {
    throw new TripExpenseValidationError(FINANCE_ERROR_CODES.linkedSourceRequired);
  }

  if (input.title?.trim()) {
    throw new TripExpenseValidationError(FINANCE_ERROR_CODES.linkedTitleForbidden);
  }
}
