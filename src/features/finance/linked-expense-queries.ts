import "server-only";

import { getSupportedCurrencies } from "@/features/currency/queries";
import { getOrCreateTripFinanceSettings } from "./finance-settings-domain";
import {
  getLinkedTripExpenseForSource,
  listLinkedTripExpensesForSources,
  type LinkedExpenseSourceType,
} from "./finance-linked-expense-domain";
import { toEntityLinkedCostViewModel } from "./entity-linked-cost-presentation";
import type { EntityLinkedCostViewModel } from "./types";

export type EntityCostFormContext = {
  baseCurrency: string;
  currencies: Awaited<ReturnType<typeof getSupportedCurrencies>>;
};

export async function prepareEntityCostFormContext(
  tripId: string,
): Promise<EntityCostFormContext> {
  const [settings, currencies] = await Promise.all([
    getOrCreateTripFinanceSettings(tripId),
    getSupportedCurrencies(),
  ]);

  return {
    baseCurrency: settings.baseCurrency,
    currencies,
  };
}

export async function getEntityLinkedCostViewModel(
  tripId: string,
  sourceType: LinkedExpenseSourceType,
  sourceId: string,
): Promise<EntityLinkedCostViewModel | null> {
  const snapshot = await getLinkedTripExpenseForSource(tripId, sourceType, sourceId);
  return snapshot ? toEntityLinkedCostViewModel(snapshot) : null;
}

export async function attachLinkedCostsToIds<T extends { id: string }>(
  tripId: string,
  sourceType: LinkedExpenseSourceType,
  items: readonly T[],
): Promise<Array<T & { linkedCost?: EntityLinkedCostViewModel }>> {
  const linkedCosts = await listLinkedTripExpensesForSources(
    tripId,
    sourceType,
    items.map((item) => item.id),
  );

  return items.map((item) => {
    const linked = linkedCosts.get(item.id);
    return linked ? { ...item, linkedCost: toEntityLinkedCostViewModel(linked) } : item;
  });
}
