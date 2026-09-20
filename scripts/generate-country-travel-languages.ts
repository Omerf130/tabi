/**
 * Generates vendored country → travel language snapshot from Unicode CLDR territoryInfo.
 * Run: npx tsx scripts/generate-country-travel-languages.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

type LanguagePopulationMeta = {
  _populationPercent?: string;
  _officialStatus?: string;
};

type TerritoryInfoEntry = {
  languagePopulation?: Record<string, LanguagePopulationMeta>;
};

type CountryTravelLanguageEntry = {
  primary: string;
  alternatives: string[];
};

const CLDR_TERRITORY_INFO_PATH = join(
  process.cwd(),
  "node_modules/cldr-core/supplemental/territoryInfo.json",
);

const OUTPUT_PATH = join(
  process.cwd(),
  "src/features/trips/destination/data/country-travel-languages.json",
);

function normalizeTravelLanguageTag(raw: string): string {
  const tag = raw.trim().replace(/_/g, "-");
  const segments = tag.split("-").filter(Boolean);
  if (segments.length === 0) {
    return tag;
  }

  const language = segments[0].toLowerCase();
  const rest = segments.slice(1).map((segment, index) => {
    if (index === 0 && segment.length === 4) {
      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    }
    if (segment.length === 2) {
      return segment.toUpperCase();
    }
    return segment;
  });

  if (language === "zh") {
    const script = rest.find((segment) => segment === "Hans" || segment === "Hant");
    if (script === "Hant") {
      return "zh-Hant";
    }
    return "zh-Hans";
  }

  if (language === "sr") {
    const script = rest.find((segment) => segment === "Cyrl" || segment === "Latn");
    if (script === "Latn") {
      return "sr-Latn";
    }
    if (script === "Cyrl") {
      return "sr-Cyrl";
    }
  }

  if (rest.length === 0) {
    return language;
  }

  if (rest.length === 1 && rest[0].length === 2) {
    return `${language}-${rest[0]}`;
  }

  return [language, ...rest].join("-");
}

function buildCountryTravelLanguages(): Record<string, CountryTravelLanguageEntry> {
  const raw = JSON.parse(readFileSync(CLDR_TERRITORY_INFO_PATH, "utf8")) as {
    supplemental: { territoryInfo: Record<string, TerritoryInfoEntry> };
  };

  const territoryInfo = raw.supplemental.territoryInfo;
  const output: Record<string, CountryTravelLanguageEntry> = {};

  for (const [territoryCode, entry] of Object.entries(territoryInfo)) {
    if (territoryCode.startsWith("_") || territoryCode.length !== 2) {
      continue;
    }

    const languagePopulation = entry.languagePopulation;
    if (!languagePopulation) {
      continue;
    }

    const ranked = Object.entries(languagePopulation)
      .map(([languageCode, meta]) => {
        const official =
          meta._officialStatus === "official" ||
          meta._officialStatus === "de_facto_official";
        const populationPercent = Number.parseFloat(meta._populationPercent ?? "0");
        return {
          code: normalizeTravelLanguageTag(languageCode),
          official,
          populationPercent: Number.isFinite(populationPercent) ? populationPercent : 0,
        };
      })
      .sort((left, right) => {
        if (left.official !== right.official) {
          return left.official ? -1 : 1;
        }
        return right.populationPercent - left.populationPercent;
      });

    if (ranked.length === 0) {
      continue;
    }

    const primary = ranked[0].code;
    const alternatives = [
      ...new Set(
        ranked
          .slice(1)
          .filter(
            (item) =>
              item.code !== primary && (item.official || item.populationPercent >= 5),
          )
          .map((item) => item.code),
      ),
    ].slice(0, 8);

    output[territoryCode.toUpperCase()] = { primary, alternatives };
  }

  return output;
}

const generated = buildCountryTravelLanguages();
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(
  OUTPUT_PATH,
  `${JSON.stringify(
    {
      source: "Unicode CLDR territoryInfo (cldr-core supplemental)",
      generatedAt: new Date().toISOString().slice(0, 10),
      countries: generated,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Wrote ${Object.keys(generated).length} countries to ${OUTPUT_PATH}`);
console.log("CA", generated.CA);
console.log("CH", generated.CH);
console.log("JP", generated.JP);
console.log("IT", generated.IT);
