import { FINANCE_MESSAGES } from "./constants";
import type { ExpenseCategory, ExpenseSourceType } from "./types";

export class TripExpenseValidationError extends Error {
  constructor(message: string) {
    super(message);
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
    throw new TripExpenseValidationError(FINANCE_MESSAGES.expenseAmountInvalid);
  }

  if (input.sourceType === "manual") {
    if (input.sourceId) {
      throw new TripExpenseValidationError(FINANCE_MESSAGES.manualSourceIdForbidden);
    }
    if (!input.title?.trim()) {
      throw new TripExpenseValidationError(FINANCE_MESSAGES.manualTitleRequired);
    }
    return;
  }

  if (!input.sourceId?.trim()) {
    throw new TripExpenseValidationError(FINANCE_MESSAGES.linkedSourceRequired);
  }

  if (input.title?.trim()) {
    throw new TripExpenseValidationError(FINANCE_MESSAGES.linkedTitleForbidden);
  }
}
