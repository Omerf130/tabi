import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TripMemberRole } from "@/models/TripMember";
import type { QuickAddAction } from "./types";

export type QuickAddMenuOption = {
  id: QuickAddAction;
  label: string;
  description: string;
};

const OWNER_ACTIONS: QuickAddAction[] = [
  "activity",
  "accommodation",
  "transport",
  "reminder",
  "expense",
  "document",
];

const MEMBER_ACTIONS: QuickAddAction[] = ["reminder"];

const QUICK_ADD_OPTION_KEYS: Record<
  QuickAddAction,
  readonly [labelKey: string, descKey: string]
> = {
  activity: ["actions.activity", "actions.activityDesc"],
  accommodation: ["actions.accommodation", "actions.accommodationDesc"],
  transport: ["actions.transport", "actions.transportDesc"],
  reminder: ["actions.reminder", "actions.reminderDesc"],
  expense: ["actions.expense", "actions.expenseDesc"],
  document: ["actions.document", "actions.documentDesc"],
};

export function getQuickAddActionsForRole(role: TripMemberRole): QuickAddAction[] {
  return role === "owner" ? OWNER_ACTIONS : MEMBER_ACTIONS;
}

export function getQuickAddMenuOptions(
  t: AppTranslator<"QuickAdd">,
  role: TripMemberRole,
): readonly QuickAddMenuOption[] {
  return getQuickAddActionsForRole(role).map((id) => {
    const [labelKey, descKey] = QUICK_ADD_OPTION_KEYS[id];
    return {
      id,
      label: t(labelKey as Parameters<typeof t>[0]),
      description: t(descKey as Parameters<typeof t>[0]),
    };
  });
}

export function getQuickAddStepTitle(
  step: { kind: string; action?: QuickAddAction },
  t: AppTranslator<"QuickAdd">,
  tItinerary: AppTranslator<"Itinerary">,
): string {
  if (step.kind === "menu") {
    return t("menuTitle");
  }
  if (step.kind === "transport-type") {
    return tItinerary("dayActionTransportCreate");
  }
  switch (step.action) {
    case "activity":
      return tItinerary("dayActionActivityCreate");
    case "accommodation":
      return tItinerary("dayActionAccommodationCreate");
    case "transport":
      return tItinerary("dayActionTransportCreate");
    case "reminder":
      return tItinerary("dayActionReminderCreate");
    case "expense":
      return t("expenseTitle");
    case "document":
      return tItinerary("dayActionDocumentCreate");
    default:
      return t("menuTitle");
  }
}
