import { createHash } from "node:crypto";
import type {
  TripDateChangeImpact,
  TripDateChangeImpactPlan,
} from "./trip-date-change-types";

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

export function computeTripDateChangeImpactHash(
  impact: Omit<TripDateChangeImpactPlan, "impactHash" | "requiresConfirmation">,
): string {
  const payload = {
    newStartDate: impact.newStartDate,
    newEndDate: impact.newEndDate,
    activitiesToDelete: [...impact.activitiesToDelete]
      .map((item) => item.id)
      .sort(),
    accommodationsToDelete: [...impact.accommodationsToDelete]
      .map((item) => item.id)
      .sort(),
    accommodationsToClamp: [...impact.accommodationsToClamp]
      .map((item) => ({
        id: item.id,
        toCheckInDate: item.toCheckInDate,
        toCheckOutDate: item.toCheckOutDate,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    transportsToReview: [...impact.transportsToReview]
      .map((item) => item.id)
      .sort(),
    remindersOutOfRange: [...impact.remindersOutOfRange]
      .map((item) => item.id)
      .sort(),
    manualExpensesOutOfRange: [...impact.manualExpensesOutOfRange]
      .map((item) => item.id)
      .sort(),
  };

  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

export function tripDateChangeRequiresConfirmation(
  impact: TripDateChangeImpact,
): boolean {
  return (
    impact.activitiesToDelete.length > 0 ||
    impact.accommodationsToDelete.length > 0 ||
    impact.accommodationsToClamp.length > 0 ||
    impact.transportsToReview.length > 0 ||
    impact.remindersOutOfRange.length > 0 ||
    impact.manualExpensesOutOfRange.length > 0
  );
}
