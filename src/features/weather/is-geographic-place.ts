const GEOGRAPHIC_PLACE_TYPES = new Set([
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "country",
  "postal_town",
]);

const EXCLUDED_WEATHER_PLACE_TYPES = new Set([
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "meal_takeaway",
  "meal_delivery",
  "store",
  "shopping_mall",
  "supermarket",
  "lodging",
  "hotel",
  "gas_station",
  "pharmacy",
  "hospital",
  "doctor",
  "dentist",
  "school",
  "university",
  "museum",
  "tourist_attraction",
  "point_of_interest",
  "establishment",
]);

export function isGeographicWeatherPlace(
  types: string[] | undefined,
  primaryType: string | undefined,
): boolean {
  const normalizedTypes = types ?? [];

  if (primaryType && EXCLUDED_WEATHER_PLACE_TYPES.has(primaryType)) {
    return false;
  }

  if (normalizedTypes.some((type) => EXCLUDED_WEATHER_PLACE_TYPES.has(type))) {
    return false;
  }

  if (primaryType && GEOGRAPHIC_PLACE_TYPES.has(primaryType)) {
    return true;
  }

  return normalizedTypes.some((type) => GEOGRAPHIC_PLACE_TYPES.has(type));
}
