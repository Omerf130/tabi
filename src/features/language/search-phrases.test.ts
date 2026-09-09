import { describe, expect, it } from "vitest";
import { getDefaultPhrasebookPack } from "./builtin/registry";
import {
  buildSearchBlob,
  filterPhrasesByCategory,
  filterPhrasesByFavorites,
  searchPhrases,
  toSearchablePhrases,
} from "./search-phrases";

describe("searchPhrases", () => {
  const phrases = toSearchablePhrases(getDefaultPhrasebookPack().phrases);

  it("returns all phrases for an empty query", () => {
    expect(searchPhrases(phrases, "")).toHaveLength(phrases.length);
    expect(searchPhrases(phrases, "   ")).toHaveLength(phrases.length);
  });

  it("matches Hebrew source text, Japanese target text, and keywords", () => {
    expect(searchPhrases(phrases, "תודה").map((phrase) => phrase.id)).toContain(
      "basics.thank-you",
    );
    expect(searchPhrases(phrases, "ありがとう").map((phrase) => phrase.id)).toContain(
      "basics.thank-you",
    );
    expect(searchPhrases(phrases, "english").map((phrase) => phrase.id)).toContain(
      "basics.speak-english",
    );
  });

  it("builds a normalized search blob", () => {
    const phrase = phrases.find((item) => item.id === "basics.hello");
    expect(phrase).toBeDefined();
    expect(buildSearchBlob(phrase!)).toContain("קוניצ");
  });

  it("filters by category and favorites", () => {
    const transport = filterPhrasesByCategory(phrases, "transport");
    expect(transport.every((phrase) => phrase.category === "transport")).toBe(true);
    expect(transport.length).toBeGreaterThan(0);

    const favorites = filterPhrasesByFavorites(phrases, new Set(["basics.hello"]));
    expect(favorites).toHaveLength(1);
    expect(favorites[0]?.id).toBe("basics.hello");
  });
});
