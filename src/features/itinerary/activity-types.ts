import {
  createAppTranslator,
  type AppTranslator,
} from "@/features/i18n/create-app-translator";

export const ACTIVITY_TYPES = [
  "attraction",
  "transport",
  "restaurant",
  "hotel",
  "freeTime",
  "shopping",
  "other",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivityTypeLabelResolver = (type: ActivityType) => string;

export function createActivityTypeLabelResolver(
  t: AppTranslator<"Activity">,
): ActivityTypeLabelResolver {
  return (type) => t(`types.${type}`);
}

/** @deprecated Use createActivityTypeLabelResolver with next-intl instead. */
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> =
  Object.fromEntries(
    ACTIVITY_TYPES.map((type) => [
      type,
      createAppTranslator("Activity", "he")(`types.${type}`),
    ]),
  ) as Record<ActivityType, string>;
