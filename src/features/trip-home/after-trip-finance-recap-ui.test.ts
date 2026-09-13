import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildFinanceHref } from "@/features/finance/constants";

describe("after trip finance recap UI contracts", () => {
  it("places finance recap after trip summary and before memories", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/trip-home/AfterTripJourney.tsx"),
      "utf8",
    );

    expect(source).toContain('"financeRecap"');
    expect(source.indexOf("tripSummary.map")).toBeLessThan(
      source.indexOf("<AfterTripFinanceRecap"),
    );
    expect(source.indexOf("<AfterTripFinanceRecap")).toBeLessThan(
      source.indexOf("memories.href"),
    );
    expect(source.indexOf("memories.href")).toBeLessThan(
      source.indexOf("itineraryRevisit.href"),
    );
  });

  it("exposes read-only recap without mutation controls", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/trip-home/AfterTripFinanceRecap.tsx"),
      "utf8",
    );

    expect(source).not.toContain("useActionState");
    expect(source).not.toContain("delete");
    expect(source).toContain("Link");
  });

  it("links recap CTA to Finance route", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/trip-home/AfterTripFinanceRecap.tsx"),
      "utf8",
    );

    expect(source).toContain("recap.href");
    expect(buildFinanceHref("trip-1")).toBe("/app/trips/trip-1/finance");
  });
});
