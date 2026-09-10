import type { DayAddMenuAction } from "./day-action-surface.types";

export type DayAddMenuOption = {
  id: DayAddMenuAction;
  label: string;
};

export const DAY_ADD_MENU_OPTIONS: readonly DayAddMenuOption[] = [
  { id: "activity", label: "פעילות" },
  { id: "transport", label: "תחבורה" },
  { id: "document", label: "מסמך" },
  { id: "reminder", label: "תזכורת" },
] as const;

export function getDayActionSurfaceTitle(state: {
  kind: string;
  transportType?: string;
}): string {
  switch (state.kind) {
    case "menu":
      return "מה תרצה להוסיף?";
    case "activity-create":
      return "הוספת פעילות";
    case "activity-edit":
      return "עריכת פעילות";
    case "activity-move":
      return "העברה ליום אחר";
    case "transport-type":
      return "סוג תחבורה";
    case "transport-create":
      return "הוספת תחבורה";
    case "transport-edit":
      return "עריכת תחבורה";
    case "document-create":
      return "הוספת מסמך";
    case "reminder-create":
      return "תזכורת חדשה";
    case "reminder-edit":
      return "עריכת תזכורת";
    default:
      return "";
  }
}
