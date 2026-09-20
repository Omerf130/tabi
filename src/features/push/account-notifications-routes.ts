import { sanitizeProfileReturnTo } from "@/features/account/profile-return-to";

export function buildAccountNotificationsHref(returnTo?: string): string {
  if (!returnTo) {
    return "/app/account/notifications";
  }

  const trimmed = returnTo.trim();
  const safeReturnTo = sanitizeProfileReturnTo(returnTo);
  if (safeReturnTo === "/app" && trimmed !== "/app") {
    return "/app/account/notifications";
  }

  return `/app/account/notifications?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function buildTripSettingsNotificationsHref(tripId: string): string {
  return buildAccountNotificationsHref(`/app/trips/${tripId}/manage`);
}
