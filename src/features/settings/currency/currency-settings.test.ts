import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import heMessages from "../../../../messages/he.json";
import enMessages from "../../../../messages/en.json";
import { resolveManageBackHref } from "@/features/app-shell/TripManageHeader";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import {
  buildCurrencySettingsHref,
  buildSettingsHubHref,
} from "@/features/settings/constants";

const tripId = "507f1f77bcf86cd799439011";

describe("Currency settings", () => {
  it("exposes CurrencySettings messages in EN and HE", () => {
    expect(enMessages.CurrencySettings.pageTitle).toBe("Currency");
    expect(heMessages.CurrencySettings.pageTitle).toBe("מטבע");
  });

  it("uses dedicated static /manage/currency page", () => {
    const pagePath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/currency/page.tsx",
    );
    const source = readFileSync(pagePath, "utf8");
    expect(source).toContain("CurrencySettingsContent");
    expect(source).not.toContain("TripManagementShell");
  });

  it("routes header back to Settings hub", () => {
    const path = buildCurrencySettingsHref(tripId);
    expect(resolveManageBackHref(path, tripId)).toBe(buildSettingsHubHref(tripId));
    expect(getActiveNavSection(path, tripId)).toBe("settings");
  });

  it("separates trip and home currency in client UI", () => {
    const clientPath = join(
      process.cwd(),
      "src/features/settings/currency/CurrencySettings.client.tsx",
    );
    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain("tripCurrencySection");
    expect(source).toContain("myCurrencySection");
    expect(source).toContain("notSelected");
    expect(source).toContain("baseCurrencyLocked");
    expect(source).not.toContain("budgetAmount");
  });

  it("does not preselect a home currency when unset", () => {
    const clientPath = join(
      process.cwd(),
      "src/features/settings/currency/CurrencySettings.client.tsx",
    );
    const source = readFileSync(clientPath, "utf8");
    expect(source).not.toMatch(/homeCurrency\s*\?\?\s*["']USD["']/);
    expect(source).not.toMatch(/homeCurrency\s*\?\?\s*["']ILS["']/);
    expect(source).toContain("homeCurrencyPickerSelectedCode(homeCurrencyDraft)");
    expect(source).toMatch(/useState<string \| null>\(\s*homeCurrency,/);
  });

  it("embeds canonical CurrencyPickerList in picker sheets", () => {
    const clientPath = join(
      process.cwd(),
      "src/features/settings/currency/CurrencySettings.client.tsx",
    );
    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain('variant="picker"');
    expect(source).toContain("CurrencyPickerList");
    expect(source).not.toMatch(
      /from "@\/features\/currency\/CurrencyPicker\.client"/,
    );
    expect(source).toContain("isHomeCurrencySaveEnabled");
    expect(source).toContain("isTripCurrencySaveEnabled");
    expect(source).toContain("footer={() =>");
    expect(source).toMatch(/renderPickerFooter\(\s*closeHomeCurrencySheet,/);
    expect(source).toMatch(/homeSheetOpen \?/);
  });

  it("uses picker sheet panel class for modal layout", () => {
    const sheetPath = join(
      process.cwd(),
      "src/features/trips/settings/travelers/TravelersSettingsSheet.client.tsx",
    );
    const stylesPath = join(
      process.cwd(),
      "src/features/trips/settings/travelers/TravelersSettings.module.scss",
    );
    const sheetSource = readFileSync(sheetPath, "utf8");
    const stylesSource = readFileSync(stylesPath, "utf8");
    expect(sheetSource).toContain("sheetPanelPicker");
    expect(stylesSource).toContain(".overlay[data-variant=\"picker\"]");
    expect(stylesSource).toContain("overflow: hidden");
  });

  it("loads supported currencies from getSupportedCurrencies", () => {
    const contentPath = join(
      process.cwd(),
      "src/features/settings/currency/CurrencySettingsContent.tsx",
    );
    const source = readFileSync(contentPath, "utf8");
    expect(source).toContain("getSupportedCurrencies");
    expect(source).toContain("currencies={currencies}");
  });

  it("Finance settings sheet is budget-only", () => {
    const sheetPath = join(
      process.cwd(),
      "src/features/finance/FinanceSettingsSheet.client.tsx",
    );
    const source = readFileSync(sheetPath, "utf8");
    expect(source).toContain("budgetAmount");
    expect(source).not.toContain("baseCurrency");
    expect(source).not.toContain("CurrencyPicker");
  });
});
