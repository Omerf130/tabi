export function formatAccommodationNightCountLabel(nightCount: number): string {
  if (nightCount === 1) {
    return "לילה אחד";
  }

  return `${nightCount} לילות`;
}
