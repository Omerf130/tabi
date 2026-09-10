import { formatCurrencyAmount } from "@/features/currency/convert";
import type { LinkedTripExpenseSnapshot } from "./finance-linked-expense-domain";
import type { EntityLinkedCostViewModel } from "./types";

export function formatEntityLinkedCostLabel(amount: number, currency: string): string {
  return formatCurrencyAmount(amount, currency);
}

export function toEntityLinkedCostViewModel(
  snapshot: LinkedTripExpenseSnapshot,
): EntityLinkedCostViewModel {
  return {
    amount: snapshot.amount,
    currency: snapshot.currency,
    category: snapshot.category,
    label: formatEntityLinkedCostLabel(snapshot.amount, snapshot.currency),
  };
}

export function formatEntityLinkedCostDisplay(
  linkedCost: EntityLinkedCostViewModel,
): string {
  return `עלות: ${linkedCost.label}`;
}
