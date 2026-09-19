import type { CreateTripWizardActionResult } from "@/features/trips/actions";

export function isCreateTripWizardSuccess(
  result: CreateTripWizardActionResult,
): result is { tripId: string } {
  return "tripId" in result && typeof result.tripId === "string";
}

export function isCreateTripWizardFailure(
  result: CreateTripWizardActionResult,
): result is Exclude<CreateTripWizardActionResult, { tripId: string }> {
  return !isCreateTripWizardSuccess(result);
}
