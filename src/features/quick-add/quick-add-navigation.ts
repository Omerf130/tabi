import type { QuickAddAction, QuickAddStep } from "./types";

export function canQuickAddGoBack(step: QuickAddStep): boolean {
  return step.kind === "transport-type" || step.kind === "form";
}

export function getQuickAddBackTarget(step: QuickAddStep): QuickAddStep | null {
  if (step.kind === "transport-type") {
    return { kind: "menu" };
  }
  if (step.kind === "form") {
    if (step.action === "transport") {
      return { kind: "transport-type" };
    }
    return { kind: "menu" };
  }
  return null;
}

export function quickAddActionToStep(action: QuickAddAction): QuickAddStep {
  if (action === "transport") {
    return { kind: "transport-type" };
  }
  return { kind: "form", action };
}
