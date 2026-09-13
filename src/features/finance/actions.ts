"use server";

import { requireTripOwner } from "@/features/trips/authorization";
import {
  createManualTripExpense,
  deleteManualTripExpense,
  FinanceExpenseForbiddenError,
  FinanceExpenseNotFoundError,
  FinanceExpenseValidationError,
  FrankfurterRequestError,
  updateManualTripExpense,
} from "./finance-expense-domain";
import {
  removeLinkedTripExpenseCost,
  updateLinkedTripExpenseFromFinance,
} from "./finance-linked-expense-domain";
import {
  FinanceSettingsNotFoundError,
  FinanceSettingsValidationError,
  getOrCreateTripFinanceSettings,
  updateTripFinanceSettings,
} from "./finance-settings-domain";
import { FINANCE_ERROR_CODES, type FinanceErrorCode } from "./constants";
import { revalidateFinancePaths } from "./revalidation";
import {
  createManualExpenseSchema,
  deleteManualExpenseSchema,
  removeLinkedExpenseCostSchema,
  updateLinkedExpenseSchema,
  updateManualExpenseSchema,
  updateTripFinanceSettingsSchema,
} from "./schemas";

export type FinanceSettingsActionState = {
  ok?: boolean;
  errorCode?: FinanceErrorCode;
  fieldErrors?: {
    budgetAmount?: string;
    baseCurrency?: string;
  };
};

export async function updateTripFinanceSettingsAction(
  _prev: FinanceSettingsActionState,
  formData: FormData,
): Promise<FinanceSettingsActionState> {
  const parsed = updateTripFinanceSettingsSchema.safeParse({
    tripId: formData.get("tripId"),
    baseCurrency: formData.get("baseCurrency") || undefined,
    budgetAmount: formData.has("budgetAmount")
      ? formData.get("budgetAmount")
      : undefined,
    clearBudget: formData.get("clearBudget") ?? undefined,
  });

  if (!parsed.success) {
    return {
      errorCode: FINANCE_ERROR_CODES.validationFailed,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await getOrCreateTripFinanceSettings(parsed.data.tripId);

    await updateTripFinanceSettings({
      tripId: parsed.data.tripId,
      baseCurrency: parsed.data.baseCurrency,
      budgetAmount: parsed.data.budgetAmount,
      clearBudget: parsed.data.clearBudget,
    });

    revalidateFinancePaths(parsed.data.tripId);
    return { ok: true };
  } catch (error) {
    if (error instanceof FinanceSettingsValidationError) {
      return { errorCode: error.code };
    }
    if (error instanceof FinanceSettingsNotFoundError) {
      return { errorCode: FINANCE_ERROR_CODES.settingsNotFound };
    }
    return { errorCode: FINANCE_ERROR_CODES.generic };
  }
}

export type ManualExpenseActionState = {
  ok?: boolean;
  errorCode?: FinanceErrorCode;
  expenseId?: string;
  fieldErrors?: Record<string, string>;
};

export async function createManualExpenseAction(
  _prev: ManualExpenseActionState,
  formData: FormData,
): Promise<ManualExpenseActionState> {
  const parsed = createManualExpenseSchema.safeParse({
    tripId: formData.get("tripId"),
    title: formData.get("title"),
    category: formData.get("category"),
    expenseDate: formData.get("expenseDate"),
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      errorCode: FINANCE_ERROR_CODES.validationFailed,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    const expenseId = await createManualTripExpense(parsed.data);
    revalidateFinancePaths(parsed.data.tripId);
    return { ok: true, expenseId };
  } catch (error) {
    if (error instanceof FinanceExpenseValidationError) {
      return { errorCode: error.code };
    }
    if (error instanceof FrankfurterRequestError) {
      return { errorCode: FINANCE_ERROR_CODES.conversionPreviewFailed };
    }
    return { errorCode: FINANCE_ERROR_CODES.generic };
  }
}

export async function updateManualExpenseAction(
  _prev: ManualExpenseActionState,
  formData: FormData,
): Promise<ManualExpenseActionState> {
  const parsed = updateManualExpenseSchema.safeParse({
    tripId: formData.get("tripId"),
    expenseId: formData.get("expenseId"),
    title: formData.get("title"),
    category: formData.get("category"),
    expenseDate: formData.get("expenseDate"),
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      errorCode: FINANCE_ERROR_CODES.validationFailed,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await updateManualTripExpense(parsed.data);
    revalidateFinancePaths(parsed.data.tripId);
    return { ok: true, expenseId: parsed.data.expenseId };
  } catch (error) {
    if (
      error instanceof FinanceExpenseValidationError ||
      error instanceof FinanceExpenseForbiddenError
    ) {
      return {
        errorCode:
          error instanceof FinanceExpenseValidationError
            ? error.code
            : FINANCE_ERROR_CODES.generic,
      };
    }
    if (error instanceof FinanceExpenseNotFoundError) {
      return { errorCode: FINANCE_ERROR_CODES.generic };
    }
    if (error instanceof FrankfurterRequestError) {
      return { errorCode: FINANCE_ERROR_CODES.conversionPreviewFailed };
    }
    return { errorCode: FINANCE_ERROR_CODES.generic };
  }
}

export async function updateLinkedExpenseAction(
  _prev: ManualExpenseActionState,
  formData: FormData,
): Promise<ManualExpenseActionState> {
  const parsed = updateLinkedExpenseSchema.safeParse({
    tripId: formData.get("tripId"),
    expenseId: formData.get("expenseId"),
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    category: formData.get("category") || undefined,
  });

  if (!parsed.success) {
    return {
      errorCode: FINANCE_ERROR_CODES.validationFailed,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await updateLinkedTripExpenseFromFinance(parsed.data);
    revalidateFinancePaths(parsed.data.tripId);
    return { ok: true, expenseId: parsed.data.expenseId };
  } catch (error) {
    if (
      error instanceof FinanceExpenseValidationError ||
      error instanceof FinanceExpenseForbiddenError
    ) {
      return {
        errorCode:
          error instanceof FinanceExpenseValidationError
            ? error.code
            : FINANCE_ERROR_CODES.generic,
      };
    }
    if (error instanceof FinanceExpenseNotFoundError) {
      return { errorCode: FINANCE_ERROR_CODES.generic };
    }
    if (error instanceof FrankfurterRequestError) {
      return { errorCode: FINANCE_ERROR_CODES.conversionPreviewFailed };
    }
    return { errorCode: FINANCE_ERROR_CODES.generic };
  }
}

export async function removeLinkedExpenseCostAction(
  _prev: ManualExpenseActionState,
  formData: FormData,
): Promise<ManualExpenseActionState> {
  const parsed = removeLinkedExpenseCostSchema.safeParse({
    tripId: formData.get("tripId"),
    expenseId: formData.get("expenseId"),
  });

  if (!parsed.success) {
    return { errorCode: FINANCE_ERROR_CODES.validationFailed };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await removeLinkedTripExpenseCost(parsed.data.tripId, parsed.data.expenseId);
    revalidateFinancePaths(parsed.data.tripId);
    return { ok: true };
  } catch (error) {
    if (
      error instanceof FinanceExpenseNotFoundError ||
      error instanceof FinanceExpenseForbiddenError
    ) {
      return { errorCode: FINANCE_ERROR_CODES.generic };
    }
    return { errorCode: FINANCE_ERROR_CODES.generic };
  }
}

export async function deleteManualExpenseAction(
  _prev: ManualExpenseActionState,
  formData: FormData,
): Promise<ManualExpenseActionState> {
  const parsed = deleteManualExpenseSchema.safeParse({
    tripId: formData.get("tripId"),
    expenseId: formData.get("expenseId"),
  });

  if (!parsed.success) {
    return { errorCode: FINANCE_ERROR_CODES.validationFailed };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await deleteManualTripExpense(parsed.data.tripId, parsed.data.expenseId);
    revalidateFinancePaths(parsed.data.tripId);
    return { ok: true };
  } catch (error) {
    if (
      error instanceof FinanceExpenseNotFoundError ||
      error instanceof FinanceExpenseForbiddenError
    ) {
      return { errorCode: FINANCE_ERROR_CODES.generic };
    }
    return { errorCode: FINANCE_ERROR_CODES.generic };
  }
}
