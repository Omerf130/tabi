import { describe, expect, it } from "vitest";
import {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  localeToDirection,
  localeToIntlLocale,
  parseAppLocale,
  resolveAppLocale,
} from "./locale";

describe("locale domain", () => {
  it("supports he and en", () => {
    expect(APP_LOCALES).toEqual(["he", "en"]);
    expect(DEFAULT_APP_LOCALE).toBe("he");
  });

  it("validates supported locales", () => {
    expect(parseAppLocale("he")).toBe("he");
    expect(parseAppLocale("en")).toBe("en");
    expect(parseAppLocale("fr")).toBeNull();
    expect(parseAppLocale(undefined)).toBeNull();
  });

  it("falls back invalid values to Hebrew", () => {
    expect(resolveAppLocale(undefined)).toBe("he");
    expect(resolveAppLocale("ja")).toBe("he");
  });

  it("maps direction correctly", () => {
    expect(localeToDirection("he")).toBe("rtl");
    expect(localeToDirection("en")).toBe("ltr");
  });

  it("maps Intl display locales", () => {
    expect(localeToIntlLocale("he")).toBe("he-IL");
    expect(localeToIntlLocale("en")).toBe("en-US");
  });
});
