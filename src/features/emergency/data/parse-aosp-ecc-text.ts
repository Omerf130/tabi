import type {
  AospEccRouting,
  AospEccSupportedType,
  ParsedAospCountryBlock,
  ParsedAospEccFile,
  ParsedAospEccRow,
} from "./aosp-ecc-types";
import { AOSP_ECC_SUPPORTED_TYPES } from "./aosp-ecc-types";

const SUPPORTED_TYPE_SET = new Set<string>(AOSP_ECC_SUPPORTED_TYPES);

/**
 * Routing filter (see docs/emergency.md):
 * - Include rows with at least one POLICE / AMBULANCE / FIRE type.
 * - Exclude rows explicitly marked routing: NORMAL (non-emergency routing in AOSP).
 * - When routing is absent, include (many countries omit the field; IT/JP rely on this).
 */
export function shouldIncludeAospEccRow(input: {
  types: readonly AospEccSupportedType[];
  routing: AospEccRouting;
}): boolean {
  if (input.types.length === 0) {
    return false;
  }
  if (input.routing === "NORMAL") {
    return false;
  }
  return true;
}

function parseQuotedValue(line: string, key: string): string | null {
  const match = line.match(new RegExp(`^\\s*${key}:\\s*"([^"]*)"\\s*$`));
  return match?.[1] ?? null;
}

function parseRevision(line: string): number | null {
  const match = line.match(/^\s*revision:\s*(\d+)\s*$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseType(line: string): AospEccSupportedType | null {
  const match = line.match(/^\s*types:\s*(\w+)\s*$/);
  if (!match) {
    return null;
  }
  const value = match[1];
  if (!SUPPORTED_TYPE_SET.has(value)) {
    return null;
  }
  return value as AospEccSupportedType;
}

function parseRouting(line: string): AospEccRouting {
  const match = line.match(/^\s*routing:\s*(\w+)\s*$/);
  if (!match) {
    return undefined;
  }
  if (match[1] === "EMERGENCY" || match[1] === "NORMAL") {
    return match[1];
  }
  return undefined;
}

export function parseAospEccText(source: string): ParsedAospEccFile {
  let revision = 0;
  const countries: ParsedAospCountryBlock[] = [];

  let currentCountry: ParsedAospCountryBlock | null = null;
  let currentEcc: { phoneNumber: string; types: AospEccSupportedType[]; routing: AospEccRouting } | null =
    null;
  let countryDepth = 0;
  let eccDepth = 0;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const revisionValue = parseRevision(trimmed);
    if (revisionValue !== null) {
      revision = revisionValue;
      continue;
    }

    if (trimmed === "countries {") {
      currentCountry = { isoCode: "", eccRows: [], eccFallback: null };
      countryDepth = 1;
      continue;
    }

    if (currentCountry && trimmed === "eccs {") {
      currentEcc = { phoneNumber: "", types: [], routing: undefined };
      eccDepth = 1;
      continue;
    }

    if (currentEcc) {
      const phone = parseQuotedValue(trimmed, "phone_number");
      if (phone !== null) {
        currentEcc.phoneNumber = phone;
      }
      const type = parseType(trimmed);
      if (type) {
        currentEcc.types.push(type);
      }
      const routing = parseRouting(trimmed);
      if (routing) {
        currentEcc.routing = routing;
      }

      if (trimmed === "}") {
        eccDepth -= 1;
        if (eccDepth === 0) {
          const uniqueTypes = [...new Set(currentEcc.types)];
          const row: ParsedAospEccRow = {
            phoneNumber: currentEcc.phoneNumber.trim(),
            types: uniqueTypes,
            routing: currentEcc.routing,
          };
          if (currentCountry && row.phoneNumber && shouldIncludeAospEccRow(row)) {
            currentCountry.eccRows.push(row);
          }
          currentEcc = null;
        }
      }
      continue;
    }

    if (currentCountry) {
      const iso = parseQuotedValue(trimmed, "iso_code");
      if (iso) {
        currentCountry.isoCode = iso.toUpperCase();
      }
      const fallback = parseQuotedValue(trimmed, "ecc_fallback");
      if (fallback) {
        currentCountry.eccFallback = fallback;
      }

      if (trimmed === "}") {
        countryDepth -= 1;
        if (countryDepth === 0) {
          if (currentCountry.isoCode) {
            countries.push(currentCountry);
          }
          currentCountry = null;
        }
      }
    }
  }

  return { revision, countries };
}
