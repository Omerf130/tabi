import type { AospEccSupportedType, ParsedAospCountryBlock } from "./aosp-ecc-types";
import type { EmergencyServiceCategory } from "./emergency-dataset-schema";

const SERVICE_ORDER: EmergencyServiceCategory[] = [
  "general",
  "police",
  "ambulance",
  "fire",
  "ambulance_and_fire",
];

function sortServices<T extends { category: EmergencyServiceCategory }>(services: T[]): T[] {
  return [...services].sort(
    (left, right) =>
      SERVICE_ORDER.indexOf(left.category) - SERVICE_ORDER.indexOf(right.category),
  );
}

function deriveCategory(types: readonly AospEccSupportedType[]): EmergencyServiceCategory | null {
  const set = new Set(types);
  const police = set.has("POLICE");
  const ambulance = set.has("AMBULANCE");
  const fire = set.has("FIRE");

  if (police && ambulance && fire) {
    return "general";
  }
  if (ambulance && fire && !police) {
    return "ambulance_and_fire";
  }
  if (police && !ambulance && !fire) {
    return "police";
  }
  if (ambulance && !police && !fire) {
    return "ambulance";
  }
  if (fire && !police && !ambulance) {
    return "fire";
  }
  if (types.length >= 2) {
    return "general";
  }
  return null;
}

/** Short emergency numbers — digits, optional leading +, spaces, hyphens. */
export function isValidEmergencyPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 32) {
    return false;
  }
  return /^[+]?[\d\s-]+$/.test(trimmed) && /\d/.test(trimmed);
}

export function normalizeCountryEmergencyServices(country: ParsedAospCountryBlock): Array<{
  id: string;
  category: EmergencyServiceCategory;
  phone: string;
}> {
  const byPhone = new Map<string, Set<AospEccSupportedType>>();

  for (const row of country.eccRows) {
    if (!isValidEmergencyPhoneNumber(row.phoneNumber)) {
      continue;
    }
    const phone = row.phoneNumber.trim();
    const existing = byPhone.get(phone) ?? new Set<AospEccSupportedType>();
    for (const type of row.types) {
      existing.add(type);
    }
    byPhone.set(phone, existing);
  }

  const services: Array<{ id: string; category: EmergencyServiceCategory; phone: string }> = [];

  for (const [phone, types] of byPhone.entries()) {
    const category = deriveCategory([...types]);
    if (!category) {
      continue;
    }
    services.push({
      id: `${country.isoCode}:${category}:${phone}`,
      category,
      phone,
    });
  }

  return sortServices(services);
}
