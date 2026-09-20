import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { DayAddMenuAction } from "./day-action-surface.types";

export type DayAddMenuOption = {
  id: DayAddMenuAction;
  label: string;
  description: string;
};

const DAY_ADD_MENU_OPTION_KEYS: Record<
  DayAddMenuAction,
  readonly [labelKey: keyof MessagesItinerary, descKey: keyof MessagesItinerary]
> = {
  activity: ["dayActionAddMenuActivity", "dayActionAddMenuActivityDesc"],
  transport: ["dayActionAddMenuTransport", "dayActionAddMenuTransportDesc"],
  accommodation: [
    "dayActionAddMenuAccommodation",
    "dayActionAddMenuAccommodationDesc",
  ],
  reminder: ["dayActionAddMenuReminder", "dayActionAddMenuReminderDesc"],
  document: ["dayActionAddMenuDocument", "dayActionAddMenuDocumentDesc"],
};

type MessagesItinerary = typeof import("../../../messages/he.json")["Itinerary"];

export function getDayAddMenuOptions(
  t: AppTranslator<"Itinerary">,
): readonly DayAddMenuOption[] {
  return (Object.keys(DAY_ADD_MENU_OPTION_KEYS) as DayAddMenuAction[]).map(
    (id) => {
      const [labelKey, descKey] = DAY_ADD_MENU_OPTION_KEYS[id];
      return {
        id,
        label: t(labelKey),
        description: t(descKey),
      };
    },
  );
}

export function getDayActionSurfaceTitle(
  state: {
    kind: string;
    transportType?: string;
  },
  t: AppTranslator<"Itinerary">,
): string {
  switch (state.kind) {
    case "menu":
      return t("dayActionMenu");
    case "activity-create":
      return t("dayActionActivityCreate");
    case "activity-edit":
      return t("dayActionActivityEdit");
    case "activity-move":
      return t("dayActionActivityMove");
    case "transport-type":
    case "transport-create":
      return t("dayActionTransportCreate");
    case "transport-edit":
      return t("dayActionTransportEdit");
    case "accommodation-create":
      return t("dayActionAccommodationCreate");
    case "document-create":
      return t("dayActionDocumentCreate");
    case "reminder-edit":
      return t("dayActionReminderEdit");
    default:
      return "";
  }
}
