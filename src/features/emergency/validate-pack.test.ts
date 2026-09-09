import { describe, expect, it } from "vitest";
import { DEFAULT_EMERGENCY_PACK_ID } from "./constants";
import { JP_EMERGENCY_RESOURCES } from "./builtin/jp";
import { getDefaultEmergencyPack } from "./builtin/registry";

describe("emergency pack validation", () => {
  it("registers the default JP pack", () => {
    const pack = getDefaultEmergencyPack();
    expect(pack.id).toBe(DEFAULT_EMERGENCY_PACK_ID);
    expect(pack.countryCode).toBe("JP");
    expect(pack.resources).toBe(JP_EMERGENCY_RESOURCES);
  });

  it("uses unique resource ids with required official numbers", () => {
    const ids = new Set<string>();

    for (const resource of JP_EMERGENCY_RESOURCES) {
      expect(ids.has(resource.id)).toBe(false);
      ids.add(resource.id);
      expect(resource.source.sourceLabel.trim().length).toBeGreaterThan(0);
      expect(resource.source.sourceUrl.trim().length).toBeGreaterThan(0);
      expect(resource.source.verifiedAt.trim().length).toBeGreaterThan(0);
    }

    const phones = JP_EMERGENCY_RESOURCES.flatMap((resource) => [
      resource.phone,
      resource.secondaryPhone,
      resource.internationalPhone,
    ]);

    expect(phones).toContain("110");
    expect(phones).toContain("119");
    expect(phones).toContain("050-3816-2787");
    expect(phones).toContain("+81-50-3816-2787");
    expect(phones).toContain("03-3264-0911");
    expect(phones).toContain("03-3264-0197");
  });
});
