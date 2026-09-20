import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

describe("ES4 production empty state migration", () => {
  it("Settings hub stays navigation-only without EmptyState blocks", () => {
    const hub = readSource("features/settings/SettingsHubContent.tsx");

    expect(hub).not.toContain("EmptyState");
    expect(hub).toContain("SettingsHubRow");
  });

  it("Trip document and accommodation settings use compact shared collection empty", () => {
    const documents = readSource("features/documents/TripDocumentSettings.tsx");
    const accommodations = readSource("features/accommodations/TripAccommodationSettings.tsx");

    expect(documents).toContain("TripSettingsCollectionEmpty");
    expect(documents).not.toContain("styles.empty");
    expect(accommodations).toContain("TripSettingsCollectionEmpty");
    expect(accommodations).not.toContain("styles.empty");
  });

  it("Language separates search, favorites, config, and provider states", () => {
    const language = readSource("features/language/LanguagePage.client.tsx");
    const translator = readSource("features/language/CustomPhraseTranslator.client.tsx");
    const phraseEmpty = readSource("features/language/LanguagePhraseListEmpty.client.tsx");

    expect(language).toContain("ConfigNotice");
    expect(language).toContain("ProviderAlert");
    expect(language).toContain("LanguagePhraseListEmpty");
    expect(phraseEmpty).toContain('variant="search"');
    expect(translator).toContain("ConfigNotice");
    expect(translator).toContain("ProviderAlert");
    expect(translator).not.toContain("customTranslatorDisabled");
  });

  it("Emergency preserves official data paths and uses shared config/inline states", () => {
    const emergency = readSource("features/emergency/EmergencyPageContent.tsx");
    const custom = readSource("features/emergency/CustomResourcesSection.client.tsx");

    expect(emergency).toContain('model.verified.status === "ready"');
    expect(emergency).toContain("ConfigNotice");
    expect(emergency).toContain('variant="inline"');
    expect(emergency).not.toContain("styles.notice");
    expect(custom).toContain('variant="inline"');
    expect(custom).not.toContain("styles.empty");
  });

  it("Manage reminders settings uses compact section empty without replacing create form", () => {
    const reminders = readSource("features/trips/reminders/TripReminderSettings.tsx");

    expect(reminders).toContain("TripSettingsCollectionEmpty");
    expect(reminders).toContain("addReminder");
    expect(reminders).not.toContain("styles.empty");
  });
});
