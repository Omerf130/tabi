import type { TransportType } from "@/features/transport/transport-types";

export type DayAddMenuAction = "activity" | "transport" | "document" | "reminder";

export type DayActionState =
  | { kind: "closed" }
  | { kind: "menu" }
  | { kind: "activity-create" }
  | { kind: "activity-edit"; activityId: string }
  | { kind: "activity-move"; activityId: string }
  | { kind: "transport-type" }
  | { kind: "transport-create"; transportType: TransportType }
  | { kind: "transport-edit"; transportId: string }
  | { kind: "document-create" }
  | { kind: "reminder-create" }
  | { kind: "reminder-edit"; reminderId: string };

export function isDayActionOpen(state: DayActionState): boolean {
  return state.kind !== "closed";
}
