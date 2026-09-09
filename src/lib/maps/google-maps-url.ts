export function buildGoogleMapsSearchUrl(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return "https://www.google.com/maps";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function buildGoogleMapsCoordinatesUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

export function buildTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
