export const REMINDER_ROTATION_MS = 5000;

export function getNextReminderIndex(current: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return (current + 1) % total;
}

export function shouldAutoRotateReminders(
  count: number,
  prefersReducedMotion: boolean,
): boolean {
  return count >= 2 && !prefersReducedMotion;
}

export function canOpenReminderPanel(count: number): boolean {
  return count > 0;
}
