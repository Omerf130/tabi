export function isAllowedQuickAddOriginPath(
  tripId: string,
  originPath: string,
): boolean {
  const prefix = `/app/trips/${tripId}`;
  if (originPath === prefix || originPath === `${prefix}/`) {
    return true;
  }
  return originPath.startsWith(`${prefix}/`);
}
