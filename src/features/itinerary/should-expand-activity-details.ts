import type { ActivityFormValues } from "./types";

const DEFAULT_ACTIVITY_TYPE: ActivityFormValues["type"] = "attraction";

export function shouldExpandActivityDetails(
  values: Pick<ActivityFormValues, "notes" | "type">,
  mode: "create" | "edit",
): boolean {
  if (values.notes?.trim()) {
    return true;
  }

  if (mode === "edit" && values.type !== DEFAULT_ACTIVITY_TYPE) {
    return true;
  }

  return false;
}
