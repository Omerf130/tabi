import { ACTIVITY_MESSAGES } from "./constants";

export function confirmDayActionDiscard(dirty: boolean): boolean {
  if (!dirty) {
    return true;
  }
  return window.confirm(ACTIVITY_MESSAGES.discardConfirm);
}
