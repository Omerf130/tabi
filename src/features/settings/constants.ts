export function buildSettingsHubHref(tripId: string): string {
  return `/app/trips/${tripId}/manage`;
}

export function buildSettingsLanguageHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/language`;
}

export function buildTripDetailsSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/details`;
}

export function buildTravelersSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/members`;
}

export function buildCurrencySettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/currency`;
}

export function buildSettingsMapsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/maps`;
}
