/**
 * Generates phrase-intent-catalog.ts (English Azure anchors + merged search keywords).
 * Run: npx tsx scripts/generate-phrase-intent-catalog.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HE_JA_PHRASES } from "../src/features/language/builtin/he-ja";

const JAPANESE_TEXT_PATTERN = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

const azureEntries: Array<[string, string, string, string[]]> = [
  ["basics.hello", "basics", "Hello", []],
  ["basics.thank-you", "basics", "Thank you", []],
  ["basics.thank-you-very-much", "basics", "Thank you very much", []],
  ["basics.excuse-me", "basics", "Excuse me / Sorry, may I?", ["excuse me", "sorry"]],
  ["basics.please", "basics", "Please", []],
  ["basics.yes", "basics", "Yes", []],
  ["basics.no", "basics", "No", []],
  ["basics.dont-understand", "basics", "I do not understand", ["do not understand"]],
  ["basics.speak-english", "basics", "Do you speak English?", ["english"]],
  ["basics.goodbye", "basics", "Goodbye", []],
  ["restaurants.table-for-two", "restaurants", "A table for two, please", ["table"]],
  ["restaurants.menu-english", "restaurants", "Do you have a menu in English?", ["menu"]],
  ["restaurants.no-meat", "restaurants", "Without meat, please", ["vegetarian", "no meat"]],
  ["restaurants.allergy", "restaurants", "I am allergic to… (name the ingredient)", ["allergy"]],
  ["restaurants.water", "restaurants", "Water, please", ["water"]],
  ["restaurants.bill", "restaurants", "Can we have the bill?", ["bill", "check"]],
  ["restaurants.card-payment", "restaurants", "Can I pay by card?", ["credit card", "card"]],
  ["restaurants.delicious", "restaurants", "That was very delicious", ["tasty", "delicious"]],
  ["transport.where-station", "transport", "Where is the station?", ["station", "train"]],
  ["transport.where-platform", "transport", "Where is the platform?", ["platform"]],
  ["transport.train-to", "transport", "Does this train go to…?", ["train"]],
  ["transport.buy-ticket", "transport", "Where can I buy a ticket?", ["ticket"]],
  ["transport.taxi-address", "transport", "Please take me to this address", ["taxi", "address"]],
  ["transport.one-person", "transport", "One ticket for one adult", ["adult", "one person"]],
  ["transport.next-stop", "transport", "What is the next stop?", ["next stop"]],
  ["transport.express-train", "transport", "Is this an express train?", ["express"]],
  ["hotel.reservation", "hotel", "I have a reservation", ["reservation", "booking"]],
  ["hotel.check-in", "hotel", "Check-in, please", ["check in", "check-in"]],
  ["hotel.luggage", "hotel", "Can I leave my luggage?", ["luggage"]],
  ["hotel.check-out-time", "hotel", "What time is check-out?", ["checkout", "check-out"]],
  ["hotel.wifi", "hotel", "What is the Wi-Fi password?", ["wifi", "internet"]],
  ["hotel.breakfast", "hotel", "Where is breakfast?", ["breakfast"]],
  ["hotel.towel", "hotel", "Can I have an extra towel?", ["towel"]],
  ["shopping.how-much", "shopping", "How much does this cost?", ["price", "how much"]],
  ["shopping.other-size", "shopping", "Do you have another size?", ["size"]],
  ["shopping.card", "shopping", "Can I pay by card?", ["credit card", "card"]],
  ["shopping.tax-free", "shopping", "Is tax-free shopping available?", ["tax free"]],
  ["shopping.just-looking", "shopping", "I am just looking", ["looking"]],
  ["shopping.bag", "shopping", "Can I have a bag, please?", ["bag"]],
  ["directions.restroom", "directions", "Where is the restroom?", ["toilet", "bathroom", "wc", "restroom"]],
  ["directions.exit", "directions", "Where is the exit?", ["exit"]],
  ["directions.how-to-get", "directions", "How do I get to…?", ["directions", "how to get"]],
  ["directions.far-from-here", "directions", "Is it far from here?", ["far"]],
  ["directions.walk-minutes", "directions", "How many minutes on foot?", ["walk", "minutes"]],
  ["directions.lost", "directions", "I am lost", ["lost"]],
  ["emergency.need-help", "emergency", "I need help", ["help"]],
  ["emergency.ambulance", "emergency", "Please call an ambulance", ["ambulance"]],
  ["emergency.hospital", "emergency", "Where is the nearest hospital?", ["hospital"]],
  ["emergency.lost-passport", "emergency", "I lost my passport", ["passport"]],
  ["emergency.police", "emergency", "Please call the police", ["police"]],
  ["emergency.feel-sick", "emergency", "I do not feel well", ["sick", "health"]],
  [
    "emergency.allergy-medicine",
    "emergency",
    "I have an allergy — I need medicine",
    ["medicine", "allergy"],
  ],
  ["numbers_time.one", "numbers_time", "One", ["1"]],
  ["numbers_time.two", "numbers_time", "Two", ["2"]],
  ["numbers_time.ten", "numbers_time", "Ten", ["10"]],
  ["numbers_time.what-time", "numbers_time", "What time is it?", ["time"]],
  ["numbers_time.today", "numbers_time", "Today", ["today"]],
  ["numbers_time.tomorrow", "numbers_time", "Tomorrow", ["tomorrow"]],
];

function mergeSearchKeywords(
  id: string,
  defaults: readonly string[],
): readonly string[] {
  const legacy = HE_JA_PHRASES.find((phrase) => phrase.id === id);
  const merged = new Set<string>();

  for (const keyword of defaults) {
    merged.add(keyword);
  }

  for (const keyword of legacy?.searchKeywords ?? []) {
    if (JAPANESE_TEXT_PATTERN.test(keyword)) {
      continue;
    }
    merged.add(keyword);
  }

  return [...merged];
}

const lines: string[] = [];
lines.push('import type { PhrasebookCategory } from "./types";');
lines.push('import { resolvePhraseIntentMessageKey } from "./phrase-intent-message-key";');
lines.push('import type { PhraseIntent } from "./phrase-intent-types";');
lines.push("");
lines.push("function definePhraseIntent(");
lines.push("  id: string,");
lines.push("  category: PhrasebookCategory,");
lines.push("  azureSourceText: string,");
lines.push("  searchKeywords?: readonly string[],");
lines.push("): PhraseIntent {");
lines.push("  return {");
lines.push("    id,");
lines.push("    category,");
lines.push("    messageKey: resolvePhraseIntentMessageKey(id),");
lines.push("    azureSourceText,");
lines.push("    searchKeywords,");
lines.push("  };");
lines.push("}");
lines.push("");
lines.push("export const PHRASE_INTENTS: readonly PhraseIntent[] = [");

for (const [id, category, azureSourceText, defaultKeywords] of azureEntries) {
  const keywords = mergeSearchKeywords(id, defaultKeywords);
  const keywordPart = keywords.length ? `, ${JSON.stringify(keywords)}` : "";
  lines.push(
    `  definePhraseIntent(${JSON.stringify(id)}, ${JSON.stringify(category)}, ${JSON.stringify(azureSourceText)}${keywordPart}),`,
  );
}

lines.push("] as const;");
lines.push("");
lines.push("export function getPhraseIntentById(id: string): PhraseIntent | undefined {");
lines.push("  return PHRASE_INTENTS.find((intent) => intent.id === id);");
lines.push("}");
lines.push("");
lines.push("export function listPhraseIntentsInCatalogOrder(): readonly PhraseIntent[] {");
lines.push("  return PHRASE_INTENTS;");
lines.push("}");

const outPath = join(process.cwd(), "src/features/language/phrase-intent-catalog.ts");
writeFileSync(outPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${azureEntries.length} intents to ${outPath}`);
