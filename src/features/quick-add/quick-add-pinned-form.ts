import overlayStyles from "@/features/itinerary/AddItemFlow.module.scss";

export type QuickAddPinnedActionFooterProps = {
  /** Global Quick Add mobile: fields scroll, primary action pinned outside scroll. */
  pinnedActionFooter?: boolean;
};

export function mergePlannerPinnedFormClass(
  baseClass: string,
  pinnedActionFooter?: boolean,
): string {
  if (!pinnedActionFooter) {
    return baseClass;
  }
  return `${baseClass} ${overlayStyles.plannerFormPinned}`;
}

export function resolvePinnedPlannerFooterClass(
  pinnedActionFooter: boolean | undefined,
  defaultFooterClass: string,
): string {
  if (!pinnedActionFooter) {
    return defaultFooterClass;
  }
  return overlayStyles.pinnedActionFooter;
}

export const plannerFormScrollClass = overlayStyles.plannerFormScroll;
