import { describe, expect, it } from "vitest";
import heMessages from "../../../messages/he.json";
import enMessages from "../../../messages/en.json";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import { buildTripManagementHref } from "@/features/trip-management/constants";
import { buildSettingsProfileHref } from "@/features/account/profile-return-to";
import {
  buildAppearanceSettingsHref,
  buildCurrencySettingsHref,
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
  themeKey: "default" as const,
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

function buildModel(
  overrides: Partial<Parameters<typeof buildSettingsHubViewModel>[0]> = {},
) {
  const tHe = createAppTranslator("Settings", "he");
  return buildSettingsHubViewModel({
    trip: baseTrip,
    isOwner: true,
    baseCurrency: "ILS",
    locale: "he",
    t: tHe,
    ...overrides,
  });
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
    const model = buildModel();

    expect(findRow(model, "trip-details")?.href).toBe(
      `/app/trips/${tripId}/manage/details`,
    );
    expect(findRow(model, "travelers")?.href).toBe(
      `/app/trips/${tripId}/manage/members`,
    );
    expect(findRow(model, "trip-details")?.comingSoon).toBe(false);
    expect(findRow(model, "travelers")?.comingSoon).toBe(false);
  });

  it("connects currency to dedicated currency settings", () => {
    const model = buildModel();

    expect(findRow(model, "currency")?.href).toBe(buildCurrencySettingsHref(tripId));
    expect(findRow(model, "currency")?.comingSoon).toBe(false);
  });

  it("connects language to the dedicated settings language route", () => {
    const model = buildModel();

    expect(findRow(model, "language")?.href).toBe(
      buildSettingsLanguageHref(tripId),
    );
    expect(findRow(model, "language")?.comingSoon).toBe(false);
    expect(findRow(model, "maps")?.comingSoon).toBe(false);
    expect(findRow(model, "maps")?.href).toContain("/manage/maps");
  });

  it("links Profile to the global account route with returnTo", () => {
    const model = buildModel();
    const profile = findRow(model, "profile");
    expect(profile?.comingSoon).toBe(false);
    expect(profile?.href).toBe(buildSettingsProfileHref(tripId));
  });

  it("connects appearance to dedicated theme settings", () => {
    const model = buildModel();
    expect(findRow(model, "theme")?.href).toBe(buildAppearanceSettingsHref(tripId));
    expect(findRow(model, "theme")?.comingSoon).toBe(false);
  });

  it("marks future features as coming soon without hrefs", () => {
    const model = buildModel();

    for (const rowId of [
      "notifications",
      "export",
      "delete-trip",
      "security",
      "help",
    ]) {
      const row = findRow(model, rowId);
      expect(row?.comingSoon).toBe(true);
      expect(row?.href).toBeUndefined();
    }
  });

  it("does not expose trip content management in the settings hub", () => {
    const ownerModel = buildModel();
    const memberModel = buildModel({
      trip: { ...baseTrip, role: "member" },
      isOwner: false,
    });

    for (const model of [ownerModel, memberModel]) {
      expect(model.sections.find((section) => section.id === "content")).toBeUndefined();
      for (const rowId of ["accommodations", "transport", "documents", "reminders"]) {
        expect(findRow(model, rowId)).toBeUndefined();
      }
    }
  });

  it("keeps underlying management routes available outside the hub", () => {
    expect(buildTripManagementHref(tripId, "accommodations")).toBe(
      `/app/trips/${tripId}/manage/accommodations`,
    );
    expect(buildTripManagementHref(tripId, "transport")).toBe(
      `/app/trips/${tripId}/manage/transport`,
    );
    expect(buildTripManagementHref(tripId, "documents")).toBe(
      `/app/trips/${tripId}/manage/documents`,
    );
    expect(buildTripManagementHref(tripId, "reminders")).toBe(
      `/app/trips/${tripId}/manage/reminders`,
    );
  });

  it("localizes section titles in English", () => {
    const tEn = createAppTranslator("Settings", "en");
    const model = buildSettingsHubViewModel({
      trip: baseTrip,
      isOwner: true,
      baseCurrency: "USD",
      locale: "en",
      t: tEn,
    });

    expect(model.sections.map((section) => section.title)).toEqual([
      "Trip",
      "Preferences",
      "Data & Management",
      "Account",
    ]);
  });
});
