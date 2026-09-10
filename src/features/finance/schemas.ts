import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import { parseAmount } from "@/features/currency/convert";
import { ACTIVITY_COST_CATEGORIES } from "./entity-cost-schema";
import { EXPENSE_CATEGORIES } from "./constants";

const objectIdSchema = z.string().refine(isValidObjectId, { message: "Invalid id" });

const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Invalid currency code");

const optionalBudgetAmountSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  },
  z.union([
    z.null(),
    z
      .string()
      .transform((raw, ctx) => {
        const parsed = parseAmount(raw);
        if (parsed === null || parsed <= 0) {
          ctx.addIssue({ code: "custom", message: "Invalid budget amount" });
          return z.NEVER;
        }
        return parsed;
      }),
  ]),
);

export const updateTripFinanceSettingsSchema = z.object({
  tripId: objectIdSchema,
  baseCurrency: currencyCodeSchema.optional(),
  budgetAmount: optionalBudgetAmountSchema.optional(),
  clearBudget: z
    .preprocess((value) => value === "true" || value === true, z.boolean())
    .optional(),
});

export type UpdateTripFinanceSettingsInput = z.infer<
  typeof updateTripFinanceSettingsSchema
>;

const expenseAmountSchema = z
  .string()
  .trim()
  .transform((raw, ctx) => {
    const parsed = parseAmount(raw);
    if (parsed === null || parsed <= 0) {
      ctx.addIssue({ code: "custom", message: "Invalid amount" });
      return z.NEVER;
    }
    return parsed;
  });

const optionalNotesSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return null;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z.union([z.null(), z.string().max(500)]),
);

const manualExpenseFieldsSchema = z.object({
  title: z.string().trim().min(1).max(120),
  category: z.enum(EXPENSE_CATEGORIES),
  expenseDate: z
    .string()
    .trim()
    .refine(isValidCalendarDateString, { message: "Invalid date" }),
  amount: expenseAmountSchema,
  currency: currencyCodeSchema,
  notes: optionalNotesSchema.optional(),
});

export const createManualExpenseSchema = manualExpenseFieldsSchema.extend({
  tripId: objectIdSchema,
});

export const updateManualExpenseSchema = manualExpenseFieldsSchema.extend({
  tripId: objectIdSchema,
  expenseId: objectIdSchema,
});

export const deleteManualExpenseSchema = z.object({
  tripId: objectIdSchema,
  expenseId: objectIdSchema,
});

export type CreateManualExpenseInput = z.infer<typeof createManualExpenseSchema>;
export type UpdateManualExpenseInput = z.infer<typeof updateManualExpenseSchema>;
export type DeleteManualExpenseInput = z.infer<typeof deleteManualExpenseSchema>;

export const updateLinkedExpenseSchema = z.object({
  tripId: objectIdSchema,
  expenseId: objectIdSchema,
  amount: expenseAmountSchema,
  currency: currencyCodeSchema,
  category: z.enum(ACTIVITY_COST_CATEGORIES).optional(),
});

export const removeLinkedExpenseCostSchema = z.object({
  tripId: objectIdSchema,
  expenseId: objectIdSchema,
});

export type UpdateLinkedExpenseInput = z.infer<typeof updateLinkedExpenseSchema>;
export type RemoveLinkedExpenseCostInput = z.infer<typeof removeLinkedExpenseCostSchema>;