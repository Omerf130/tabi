import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Azure translator security guardrails", () => {
  it("keeps Azure modules server-only", () => {
    const files = [
      "src/features/language/translation/azure-translator.server.ts",
      "src/features/language/translation/azure-translator-config.ts",
      "src/features/language/translation/resolve-canonical-phrase-translations.ts",
      "src/features/language/translation/phrase-translation-cache-repository.ts",
      "src/models/PhraseTranslationCache.ts",
    ];

    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      expect(source).toContain('import "server-only"');
    }
  });

  it("does not expose Azure credentials via NEXT_PUBLIC env vars in source", () => {
    const envExample = readFileSync(join(root, ".env.example"), "utf8");
    expect(envExample).toContain("AZURE_TRANSLATOR_KEY");
    expect(envExample).not.toContain("NEXT_PUBLIC_AZURE");

    const packageSource = readFileSync(join(root, "package.json"), "utf8");
    expect(packageSource).not.toContain("NEXT_PUBLIC_AZURE");
  });

  it("does not add a public translation HTTP route in app router", () => {
    const queriesSource = readFileSync(join(root, "src/features/language/queries.ts"), "utf8");
    expect(queriesSource).toContain("prepare-phrasebook-runtime");
    expect(queriesSource).not.toContain("getDefaultPhrasebookPack");
  });
});
