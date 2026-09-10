import { z } from "zod";
import { parseAmount } from "@/features/currency/convert";
import type { ExpenseCategory } from "./types";

export const ACTIVITY_COST_CATEGORIES = [
  "food",
  "activities",
  "shopping",
  "transport",
  "other",
] as const satisfies readonly ExpenseCategory[];

export type ActivityCostCategory = (typeof ACTIVITY_COST_CATEGORIES)[number];

const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Invalid currency code");

const positiveAmountSchema = z
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

export type ParsedEntityCost =
  | { hasCost: false }
  | {
      hasCost: true;
      amount: number;
      currency: string;
      category?: ActivityCostCategory;
    };

function readCostAmount(formData: FormData): string {
  return String(formData.get("costAmount") ?? "").trim();
}

function readCostCurrency(formData: FormData): string {
  return String(formData.get("costCurrency") ?? "").trim();
}

function readCostCategory(formData: FormData): string {
  return String(formData.get("costCategory") ?? "").trim();
}

export function parseActivityEntityCostFromFormData(
  formData: FormData,
): { ok: true; value: ParsedEntityCost } | { ok: false; error: string } {
  const amountRaw = readCostAmount(formData);
  if (!amountRaw) {
    return { ok: true, value: { hasCost: false } };
  }

  const parsed = z
    .object({
      amount: positiveAmountSchema,
      currency: currencyCodeSchema,
      category: z.enum(ACTIVITY_COST_CATEGORIES),
    })
    .safeParse({
      amount: amountRaw,
      currency: readCostCurrency(formData),
      category: readCostCategory(formData) || "activities",
    });

  if (!parsed.success) {
    return { ok: false, error: "נתוני עלות לא תקינים" };
  }

  return {
    ok: true,
    value: {
      hasCost: true,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      category: parsed.data.category,
    },
  };
}

export function parseSimpleEntityCostFromFormData(
  formData: FormData,
): { ok: true; value: ParsedEntityCost } | { ok: false; error: string } {
  const amountRaw = readCostAmount(formData);
  if (!amountRaw) {
    return { ok: true, value: { hasCost: false } };
  }

  const parsed = z
    .object({
      amount: positiveAmountSchema,
      currency: currencyCodeSchema,
    })
    .safeParse({
      amount: amountRaw,
      currency: readCostCurrency(formData),
    });

  if (!parsed.success) {
    return { ok: false, error: "נתוני עלות לא תקינים" };
  }

  return {
    ok: true,
    value: {
      hasCost: true,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
    },
  };
}
