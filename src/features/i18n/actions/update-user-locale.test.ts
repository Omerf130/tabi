import { describe, expect, it } from "vitest";
import { z } from "zod";
import { APP_LOCALES, parseAppLocale } from "@/features/i18n/locale";

const updateUserLocaleSchema = z.object({
  locale: z.enum(APP_LOCALES),
});

describe("updateUserLocale validation", () => {
  it("accepts supported locales", () => {
    expect(updateUserLocaleSchema.safeParse({ locale: "he" }).success).toBe(
      true,
    );
    expect(updateUserLocaleSchema.safeParse({ locale: "en" }).success).toBe(
      true,
    );
  });

  it("rejects unsupported locales", () => {
    expect(updateUserLocaleSchema.safeParse({ locale: "fr" }).success).toBe(
      false,
    );
  });

  it("keeps locale user-scoped rather than trip-scoped", () => {
    expect(parseAppLocale("en")).toBe("en");
    expect(APP_LOCALES).not.toContain("trip" as never);
  });
});
