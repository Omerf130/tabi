export function buildSettingsHubHref(tripId: string): string {
  return `/app/trips/${tripId}/manage`;
}

export function buildSettingsLanguageHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/language`;
}

export function buildFinanceSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/finance?settings=1`;
}
