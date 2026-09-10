type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

export function extractCountryCodeFromAddressComponents(
  components: AddressComponent[] | undefined,
): string | undefined {
  if (!components?.length) {
    return undefined;
  }

  const match = components.find((component) => component.types?.includes("country"));
  const code = match?.shortText?.trim().toUpperCase();
  if (!code || code.length !== 2) {
    return undefined;
  }
  return code;
}
