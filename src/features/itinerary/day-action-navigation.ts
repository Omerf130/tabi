import type { DayActionState } from "./day-action-surface.types";

export function getDayActionBackTarget(state: DayActionState): DayActionState | null {
  switch (state.kind) {
    case "activity-create":
    case "document-create":
    case "reminder-create":
    case "accommodation-create":
    case "transport-type":
      return { kind: "menu" };
    case "transport-create":
      return { kind: "transport-type" };
    default:
      return null;
  }
}

export function canDayActionGoBack(state: DayActionState): boolean {
  return getDayActionBackTarget(state) !== null;
}

export function shouldShowDayContext(state: DayActionState): boolean {
  return (
    state.kind !== "closed" &&
    state.kind !== "menu" &&
    state.kind !== "activity-move" &&
    state.kind !== "activity-edit" &&
    state.kind !== "transport-edit" &&
    state.kind !== "reminder-edit"
  );
}
