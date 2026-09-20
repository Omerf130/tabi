/**
 * Generates vendored country emergency services from pinned AOSP eccdata.txt.
 * Run: npm run generate:emergency-country-data
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseAospEccText, shouldIncludeAospEccRow } from "../src/features/emergency/data/parse-aosp-ecc-text";
import {
  isValidEmergencyPhoneNumber,
  normalizeCountryEmergencyServices,
} from "../src/features/emergency/data/normalize-emergency-services";
import type { AospEccSupportedType } from "../src/features/emergency/data/aosp-ecc-types";
import { AOSP_ECC_SUPPORTED_TYPES } from "../src/features/emergency/data/aosp-ecc-types";
import type { CountryEmergencyServicesDataset } from "../src/features/emergency/data/emergency-dataset-schema";

const ROOT = process.cwd();
const PINNED = JSON.parse(
  readFileSync(join(ROOT, "scripts/vendor/aosp-ecc/PINNED_SOURCE.json"), "utf8").replace(
    /^\uFEFF/,
    "",
  ),
) as {
  gitCommit: string;
  gitUrl: string;
  inputPath: string;
};

const SOURCE_PATH = join(ROOT, "scripts/vendor/aosp-ecc/eccdata.txt");
const OUTPUT_DIR = join(ROOT, "src/features/emergency/data");
const SERVICES_PATH = join(OUTPUT_DIR, "country-emergency-services.json");
const MANIFEST_PATH = join(OUTPUT_DIR, "emergency-dataset-manifest.json");

const SUPPORTED_TYPE_SET = new Set<string>(AOSP_ECC_SUPPORTED_TYPES);

function countDiscards(source: string) {
  const reasons: Record<string, number> = {};
  const bump = (key: string) => {
    reasons[key] = (reasons[key] ?? 0) + 1;
  };

  let inEcc = false;
  let phone = "";
  let types: string[] = [];
  let routing: string | undefined;

  for (const rawLine of source.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (trimmed === "eccs {") {
      inEcc = true;
      phone = "";
      types = [];
      routing = undefined;
      continue;
    }
    if (!inEcc) {
      continue;
    }
    const phoneMatch = trimmed.match(/^phone_number:\s*"([^"]*)"/);
    if (phoneMatch) {
      phone = phoneMatch[1];
    }
    const typeMatch = trimmed.match(/^types:\s*(\w+)/);
    if (typeMatch) {
      types.push(typeMatch[1]);
    }
    const routingMatch = trimmed.match(/^routing:\s*(\w+)/);
    if (routingMatch) {
      routing = routingMatch[1];
    }
    if (trimmed === "}") {
      inEcc = false;
      if (!phone.trim()) {
        bump("missing_phone");
        continue;
      }
      const supported = types.filter((type) => SUPPORTED_TYPE_SET.has(type)) as AospEccSupportedType[];
      for (const type of types) {
        if (!SUPPORTED_TYPE_SET.has(type)) {
          bump(`unsupported_type:${type}`);
        }
      }
      if (supported.length === 0) {
        bump("no_supported_types");
        continue;
      }
      if (routing === "NORMAL") {
        bump("routing_normal");
        continue;
      }
      if (!isValidEmergencyPhoneNumber(phone)) {
        bump("invalid_phone_format");
        continue;
      }
      if (!shouldIncludeAospEccRow({ types: supported, routing: routing as "EMERGENCY" | "NORMAL" | undefined })) {
        bump("filtered");
      }
    }
  }

  return reasons;
}

function main() {
  const sourceText = readFileSync(SOURCE_PATH, "utf8");
  const contentSha256 = createHash("sha256").update(sourceText).digest("hex");
  const parsed = parseAospEccText(sourceText);

  const countries: CountryEmergencyServicesDataset["countries"] = {};
  let serviceRows = 0;
  let dedupeMergedPhones = 0;

  for (const block of parsed.countries) {
    const rawRows = block.eccRows.length;
    const services = normalizeCountryEmergencyServices(block);
    if (rawRows > services.length) {
      dedupeMergedPhones += rawRows - services.length;
    }
    if (services.length === 0) {
      continue;
    }
    countries[block.isoCode] = {
      countryCode: block.isoCode,
      eccFallback: block.eccFallback,
      services,
    };
    serviceRows += services.length;
  }

  const generatedAt = new Date().toISOString();
  const manifest = {
    sourceId: "aosp-ecc" as const,
    sourceRevision: parsed.revision,
    gitCommit: PINNED.gitCommit,
    sourceUrl: `${PINNED.gitUrl}/${PINNED.inputPath}`,
    inputPath: PINNED.inputPath,
    generatedAt,
    contentSha256,
    datasetImportedAt: generatedAt.slice(0, 10),
    stats: {
      countryBlocksParsed: parsed.countries.length,
      countriesWithServices: Object.keys(countries).length,
      serviceRows,
      sourceEccRowsDiscarded: Object.values(countDiscards(sourceText)).reduce((a, b) => a + b, 0),
      discardReasons: countDiscards(sourceText),
      dedupeMergedPhones,
    },
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });

  writeFileSync(SERVICES_PATH, `${JSON.stringify({ countries }, null, 2)}\n`, "utf8");
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ manifest, sample: {
    JP: countries.JP,
    IT: countries.IT,
    US: countries.US,
    GB: countries.GB,
    IL: countries.IL,
  } }, null, 2));
}

main();
