import type { DayAddMenuAction } from "./day-action-surface.types";

export type DayAddMenuOption = {
  id: DayAddMenuAction;
  label: string;
  description: string;
};

export const DAY_ADD_MENU_OPTIONS: readonly DayAddMenuOption[] = [
  {
    id: "activity",
    label: "פעילות",
    description: "אטרקציה, מסעדה, מוזיאון ועוד",
  },
  {
    id: "transport",
    label: "תחבורה",
    description: "רכבת, טיסה, אוטובוס, רכב או מונית",
  },
  {
    id: "accommodation",
    label: "מקום לינה",
    description: "מלון או מקום לינה בטיול",
  },
  {
    id: "reminder",
    label: "תזכורת",
    description: "משהו אישי שחשוב לזכור",
  },
  {
    id: "document",
    label: "מסמך",
    description: "קובץ שרלוונטי ליום הזה",
  },
] as const;

export function getDayActionSurfaceTitle(state: {
  kind: string;
  transportType?: string;
}): string {
  switch (state.kind) {
    case "menu":
      return "הוספה ליום";
    case "activity-create":
      return "הוספת פעילות";
    case "activity-edit":
      return "עריכת פעילות";
    case "activity-move":
      return "העברה ליום אחר";
    case "transport-type":
    case "transport-create":
      return "הוספת תחבורה";
    case "transport-edit":
      return "עריכת תחבורה";
    case "accommodation-create":
      return "הוספת מקום לינה";
    case "document-create":
      return "הוספת מסמך";
    case "reminder-create":
      return "הוספת תזכורת";
    case "reminder-edit":
      return "עריכת תזכורת";
    default:
      return "";
  }
}
