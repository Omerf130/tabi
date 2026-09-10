import type { ActivityViewModel } from "../types";

export function activityViewModelFixture(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id">,
): ActivityViewModel {
  return {
    date: "2026-10-26",
    title: "Activity",
    type: "attraction",
    typeLabel: "אטרקציה",
    order: 0,
    placeSource: "manual",
    ...overrides,
  };
}
