import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { Accommodation } from "@/models/Accommodation";
import { Transport } from "@/models/Transport";
import { FINANCE_UI_KEYS } from "./constants";
import type { FinanceLabels } from "./finance-labels";
import type { PublicTripExpense } from "./types";

export type ExpenseSourceTitleLookup = {
  activities: Map<string, string>;
  accommodations: Map<string, string>;
  transports: Map<string, string>;
};

function resolveStoredAccommodationTitle(
  accommodation: {
    manualName?: string | null;
    name?: string | null;
  },
  accommodationFallbackName: string,
): string {
  return (
    accommodation.manualName?.trim() ||
    accommodation.name?.trim() ||
    accommodationFallbackName
  );
}

function resolveTransportTitle(transport: {
  departure: { locationName: string };
  arrival: { locationName: string };
}): string {
  return `${transport.departure.locationName} → ${transport.arrival.locationName}`;
}

export async function resolveExpenseSourceTitles(
  tripId: string,
  expenses: readonly PublicTripExpense[],
  labels: Pick<FinanceLabels, "resolveUiText">,
): Promise<ExpenseSourceTitleLookup> {
  const activityIds = new Set<string>();
  const accommodationIds = new Set<string>();
  const transportIds = new Set<string>();

  for (const expense of expenses) {
    if (!expense.sourceId || expense.sourceType === "manual") {
      continue;
    }
    switch (expense.sourceType) {
      case "activity":
        activityIds.add(expense.sourceId);
        break;
      case "accommodation":
        accommodationIds.add(expense.sourceId);
        break;
      case "transport":
        transportIds.add(expense.sourceId);
        break;
      default:
        break;
    }
  }

  await connectDb();

  const accommodationFallbackName = labels.resolveUiText(
    FINANCE_UI_KEYS.accommodationFallbackName,
  );

  const [activities, accommodations, transports] = await Promise.all([
    activityIds.size
      ? Activity.find({ tripId, _id: { $in: [...activityIds] } })
          .select("_id title")
          .lean()
      : Promise.resolve([]),
    accommodationIds.size
      ? Accommodation.find({ tripId, _id: { $in: [...accommodationIds] } })
          .select("_id manualName name")
          .lean()
      : Promise.resolve([]),
    transportIds.size
      ? Transport.find({ tripId, _id: { $in: [...transportIds] } })
          .select("_id departure arrival")
          .lean()
      : Promise.resolve([]),
  ]);

  return {
    activities: new Map(
      activities.map((activity) => [activity._id.toString(), activity.title.trim()]),
    ),
    accommodations: new Map(
      accommodations.map((accommodation) => [
        accommodation._id.toString(),
        resolveStoredAccommodationTitle(accommodation, accommodationFallbackName),
      ]),
    ),
    transports: new Map(
      transports.map((transport) => [
        transport._id.toString(),
        resolveTransportTitle(transport),
      ]),
    ),
  };
}

export function resolveLinkedExpenseTitle(
  expense: PublicTripExpense,
  lookup: ExpenseSourceTitleLookup,
  labels: Pick<FinanceLabels, "resolveUiText">,
): string {
  const deletedFallback = labels.resolveUiText(FINANCE_UI_KEYS.deletedSourceFallback);

  if (expense.sourceType === "manual") {
    return expense.title?.trim() || deletedFallback;
  }

  const sourceId = expense.sourceId;
  if (!sourceId) {
    return deletedFallback;
  }

  switch (expense.sourceType) {
    case "activity":
      return lookup.activities.get(sourceId) ?? deletedFallback;
    case "accommodation":
      return lookup.accommodations.get(sourceId) ?? deletedFallback;
    case "transport":
      return lookup.transports.get(sourceId) ?? deletedFallback;
    default:
      return deletedFallback;
  }
}

export function resolveLinkedExpenseSourceLabel(
  sourceType: PublicTripExpense["sourceType"],
  labels: Pick<FinanceLabels, "resolveLinkedSourceLabel">,
): string | null {
  return labels.resolveLinkedSourceLabel(sourceType);
}
