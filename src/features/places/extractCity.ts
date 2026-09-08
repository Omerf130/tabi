type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

export function extractCityFromAddressComponents(
  components: AddressComponent[] | undefined,
): string | undefined {
  if (!components?.length) {
    return undefined;
  }

  const priorityTypes = [
    "locality",
    "administrative_area_level_2",
    "administrative_area_level_1",
  ];

  for (const type of priorityTypes) {
    const match = components.find((component) => component.types?.includes(type));
    const text = match?.longText?.trim() || match?.shortText?.trim();
    if (text) {
      return text;
    }
  }

  return undefined;
}

export function extractCityFromSecondaryText(secondaryText?: string): string | undefined {
  if (!secondaryText?.trim()) {
    return undefined;
  }

  const parts = secondaryText.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return undefined;
  }

  return parts[parts.length - 1];
}
