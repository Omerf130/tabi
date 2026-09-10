type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

export function extractCountryFromAddressComponents(
  components: AddressComponent[] | undefined,
): string | undefined {
  if (!components?.length) {
    return undefined;
  }

  const match = components.find((component) => component.types?.includes("country"));
  const text = match?.longText?.trim() || match?.shortText?.trim();
  return text || undefined;
}
