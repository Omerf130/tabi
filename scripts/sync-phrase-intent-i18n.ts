/**
 * Merges Language.phrases into messages/he.json and messages/en.json from the intent catalog.
 * Hebrew UI text comes from the legacy he-ja pack source lines; English matches azureSourceText.
 *
 * Run: npx tsx scripts/sync-phrase-intent-i18n.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HE_JA_PHRASES } from "../src/features/language/builtin/he-ja";
import { PHRASE_INTENTS } from "../src/features/language/phrase-intent-catalog";

const root = process.cwd();

function buildPhrasesObject(
  resolveText: (intentId: string) => string,
): Record<string, Record<string, string>> {
  const phrases: Record<string, Record<string, string>> = {};

  for (const intent of PHRASE_INTENTS) {
    const slug = intent.id.slice(intent.category.length + 1);
    if (!phrases[intent.category]) {
      phrases[intent.category] = {};
    }
    phrases[intent.category][slug] = resolveText(intent.id);
  }

  return phrases;
}

function syncLocale(filename: "he.json" | "en.json") {
  const path = join(root, "messages", filename);
  const messages = JSON.parse(readFileSync(path, "utf8")) as {
    Language: Record<string, unknown>;
  };

  const hebrewById = new Map(HE_JA_PHRASES.map((phrase) => [phrase.id, phrase.sourceText]));
  const azureById = new Map(
    PHRASE_INTENTS.map((intent) => [intent.id, intent.azureSourceText]),
  );

  const phrases =
    filename === "he.json"
      ? buildPhrasesObject((id) => {
          const text = hebrewById.get(id);
          if (!text) {
            throw new Error(`Missing Hebrew source for ${id}`);
          }
          return text;
        })
      : buildPhrasesObject((id) => {
          const text = azureById.get(id);
          if (!text) {
            throw new Error(`Missing English azure source for ${id}`);
          }
          return text;
        });

  messages.Language = {
    ...messages.Language,
    phrases,
  };

  writeFileSync(path, `${JSON.stringify(messages, null, 2)}\n`, "utf8");
  console.log(`Updated ${filename} with ${PHRASE_INTENTS.length} phrase intents`);
}

syncLocale("he.json");
syncLocale("en.json");
