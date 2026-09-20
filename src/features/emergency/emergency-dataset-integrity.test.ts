import { describe, expect, it } from "vitest";
import { loadEmergencyDataset } from "./data/load-emergency-dataset";

describe("generated emergency dataset integrity", () => {
  const { countries, manifest } = loadEmergencyDataset();

  it("matches manifest coverage stats", () => {
    const withServices = Object.values(countries).filter((c) => c.services.length > 0);
    expect(withServices.length).toBe(manifest.stats.countriesWithServices);
    const rowCount = withServices.reduce((sum, c) => sum + c.services.length, 0);
    expect(rowCount).toBe(manifest.stats.serviceRows);
  });

  it("pins AOSP source metadata", () => {
    expect(manifest.sourceId).toBe("aosp-ecc");
    expect(manifest.gitCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(manifest.sourceRevision).toBeGreaterThan(0);
    expect(manifest.contentSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes IT with general and distinct services", () => {
    const it = countries.IT;
    expect(it?.services.map((s) => ({ category: s.category, phone: s.phone }))).toEqual([
      { category: "general", phone: "112" },
      { category: "police", phone: "113" },
      { category: "ambulance", phone: "118" },
      { category: "fire", phone: "115" },
    ]);
  });

  it("normalizes US as general 911", () => {
    expect(countries.US?.services).toEqual([
      expect.objectContaining({ category: "general", phone: "911" }),
    ]);
  });

  it("normalizes GB as general 999", () => {
    expect(countries.GB?.services).toEqual([
      expect.objectContaining({ category: "general", phone: "999" }),
    ]);
  });

  it("normalizes IL police, ambulance, and fire", () => {
    expect(countries.IL?.services.map((s) => s.phone)).toEqual(["100", "101", "102"]);
  });

  it("stores ecc_fallback as metadata without extra dial rows", () => {
    const jp = countries.JP;
    expect(jp?.eccFallback).toBe("112");
    expect(jp?.services.some((s) => s.phone === "112")).toBe(false);
  });
});
