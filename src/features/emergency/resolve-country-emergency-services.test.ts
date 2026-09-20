import { describe, expect, it } from "vitest";
import { resolveCountryEmergencyServices } from "./resolve-country-emergency-services";

describe("resolveCountryEmergencyServices", () => {
  it("returns missing_destination when country code is empty", () => {
    expect(resolveCountryEmergencyServices(null).status).toBe("missing_destination");
    expect(resolveCountryEmergencyServices(undefined).status).toBe("missing_destination");
    expect(resolveCountryEmergencyServices("  ").status).toBe("missing_destination");
  });

  it("returns unsupported_country for invalid ISO codes", () => {
    const result = resolveCountryEmergencyServices("JAPAN");
    expect(result.status).toBe("unsupported_country");
    if (result.status === "unsupported_country") {
      expect(result.countryCode).toBe("JAPAN");
    }
  });

  it("returns unsupported_country for unknown ISO codes with no dataset entry", () => {
    const result = resolveCountryEmergencyServices("ZZ");
    expect(result.status).toBe("unsupported_country");
  });

  it("resolves JP from pinned dataset only", () => {
    const jp = resolveCountryEmergencyServices("jp");
    expect(jp.status).toBe("ready");
    if (jp.status === "ready") {
      expect(jp.countryCode).toBe("JP");
      expect(jp.record.services.map((s) => s.phone)).toEqual(["110", "119"]);
      expect(jp.record.services.map((s) => s.category)).toEqual([
        "police",
        "ambulance_and_fire",
      ]);
    }
  });

  it("does not fall back to JP for other countries", () => {
    const us = resolveCountryEmergencyServices("US");
    expect(us.status).toBe("ready");
    if (us.status === "ready") {
      expect(us.record.services.some((s) => s.phone === "110")).toBe(false);
      expect(us.record.services.some((s) => s.phone === "119")).toBe(false);
    }
  });

  it("resolves FR independently of JP", () => {
    const fr = resolveCountryEmergencyServices("FR");
    expect(fr.status).toBe("ready");
    if (fr.status === "ready") {
      expect(fr.countryCode).toBe("FR");
      expect(fr.record.countryCode).toBe("FR");
    }
  });
});
