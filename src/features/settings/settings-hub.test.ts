import { describe, expect, it } from "vitest";
import heMessages from "../../../messages/he.json";
import enMessages from "../../../messages/en.json";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import {
  buildFinanceSettingsHref,
  buildSettingsHubHref,
  buildSettingsLanguageHref,
} from "./constants";
import { buildSettingsHubViewModel } from "./build-settings-hub-view-model";

const tripId = "507f1f77bcf86cd799439011";

const baseTrip = {
  id: tripId,
  name: "Japan 2026",
  startDate: "2026-10-20",
  endDate: "2026-11-02",
  role: "owner" as const,
  destination: {
    displayName: "Tokyo",
    country: "Japan",
  },
};

function findRow(
  model: ReturnType<typeof buildSettingsHubViewModel>,
  rowId: string,
) {
  for (const section of model.sections) {
    const row = section.rows.find((entry) => entry.id === rowId);
    if (row) {
      return row;
    }
  }
  return undefined;
}

describe("Settings hub", () => {
  it("includes Hebrew and English Settings messages", () => {
    expect(heMessages.Settings.title).toBe("הגדרות");
    expect(heMessages.Settings.comingSoon).toBe("בקרוב");
    expect(enMessages.Settings.title).toBe("Settings");
    expect(enMessages.Settings.comingSoon).toBe("Coming Soon");
  });

  it("builds the hub route as the manage index", () => {
    expect(buildSettingsHubHref(tripId)).toBe(`/app/trips/${tripId}/manage`);
  });

  it("keeps primary Settings nav active on /manage", () => {
    expect(getActiveNavSection(`/app/trips/${tripId}/manage`, tripId)).toBe(
      "settings",
    );
    expect(
      getActiveNavSection(`/app/trips/${tripId}/manage/details`, tripId),
    ).toBe("settings");
  });

  it("links active trip rows to existing management routes", () => {
    const tHe = createAppTranslator("Settings", "he");
    const tTripManagement = createAppTranslator("TripManagement", "he");
    const model = buildSettingsHubViewModel({
      trip: baseTrip,
      isOwner: true,
      baseCurrency: "ILS",
      locale: "he",
      t: tHe,
      tTripManagement,
    });

    expect(findRow(model, "trip-details")?.href).toBe(
      `/app/trips/${tripId}/manage/details`,
    );
    expect(findRow(model, "travelers")?.href).toBe(
      `/app/trips/${tripId}/manage/members`,
    );
    expect(findRow(model, "trip-details")?.comingSoon).toBe(false);
    expect(findRow(model, "travelers")?.comingSoon).toBe(false);
  });

  it("connects currency to existing finance settings", () => {
    const tHe = createAppTranslator("Settings", "he");
    const tTripManagement = createAppTranslator("TripManagement", "he");
    const model = buildSettingsHubViewModel({
      trip: baseTrip,
      isOwner: true,
      baseCurrency: "ILS",
      locale: "he",
      t: tHe,
      tTripManagement,
    });

    expect(findRow(model, "currency")?.href).toBe(buildFinanceSettingsHref(tripId));
    expect(findRow(model, "currency")?.comingSoon).toBe(false);
  });

  it("connects language to the dedicated settings language route", () => {
    const tHe = createAppTranslator("Settings", "he");
    const tTripManagement = createAppTranslator("TripManagement", "he");
    const model = buildSettingsHubViewModel({
      trip: baseTrip,
      isOwner: true,
      baseCurrency: "ILS",
      locale: "he",
      t: tHe,
      tTripManagement,
    });

    expect(findRow(model, "language")?.href).toBe(
      buildSettingsLanguageHref(tripId),
    );
    expect(findRow(model, "language")?.comingSoon).toBe(false);
  });

  it("marks future features as coming soon without hrefs", () => {
    const tHe = createAppTranslator("Settings", "he");
    const tTripManagement = createAppTranslator("TripManagement", "he");
    const model = buildSettingsHubViewModel({
      trip: baseTrip,
      isOwner: true,
      baseCurrency: "ILS",
      locale: "he",
      t: tHe,
      tTripManagement,
    });

    for (const rowId of [
      "theme",
      "maps",
      "notifications",
      "export",
      "delete-trip",
      "profile",
      "security",
      "help",
    ]) {
      const row = findRow(model, rowId);
      expect(row?.comingSoon).toBe(true);
      expect(row?.href).toBeUndefined();
    }
  });

  it("preserves active management content routes for owners", () => {
    const tHe = createAppTranslator("Settings", "he");
    const tTripManagement = createAppTranslator("TripManagement", "he");
    const model = buildSettingsHubViewModel({
      trip: baseTrip,
      isOwner: true,
      baseCurrency: "ILS",
      locale: "he",
      t: tHe,
      tTripManagement,
    });

    const contentSection = model.sections.find((section) => section.id === "content");
    expect(contentSection?.rows.map((row) => row.id)).toEqual([
      "accommodations",
      "transport",
      "documents",
      "reminders",
    ]);
    expect(contentSection?.rows.every((row) => row.href && !row.comingSoon)).toBe(
      true,
    );
  });

  it("hides owner-only content management rows from members", () => {
    const tHe = createAppTranslator("Settings", "he");
    const tTripManagement = createAppTranslator("TripManagement", "he");
    const model = buildSettingsHubViewModel({
      trip: { ...baseTrip, role: "member" },
      isOwner: false,
      baseCurrency: "ILS",
      locale: "he",
      t: tHe,
      tTripManagement,
    });

    const contentSection = model.sections.find((section) => section.id === "content");
    expect(contentSection?.rows.map((row) => row.id)).toEqual([
      "transport",
      "reminders",
    ]);
  });

  it("localizes section titles in English", () => {
    const tEn = createAppTranslator("Settings", "en");
    const tTripManagement = createAppTranslator("TripManagement", "en");
    const model = buildSettingsHubViewModel({
      trip: baseTrip,
      isOwner: true,
      baseCurrency: "USD",
      locale: "en",
      t: tEn,
      tTripManagement,
    });

    expect(model.sections[0]?.title).toBe("Trip");
    expect(model.sections[1]?.title).toBe("Preferences");
    expect(model.sections.at(-1)?.title).toBe("Trip Content Management");
  });
});
