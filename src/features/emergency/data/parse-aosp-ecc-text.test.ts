import { describe, expect, it } from "vitest";
import { parseAospEccText, shouldIncludeAospEccRow } from "./parse-aosp-ecc-text";

describe("shouldIncludeAospEccRow", () => {
  it("excludes NORMAL routing", () => {
    expect(
      shouldIncludeAospEccRow({ types: ["POLICE"], routing: "NORMAL" }),
    ).toBe(false);
  });

  it("includes rows without routing", () => {
    expect(
      shouldIncludeAospEccRow({ types: ["POLICE"], routing: undefined }),
    ).toBe(true);
  });

  it("includes EMERGENCY routing", () => {
    expect(
      shouldIncludeAospEccRow({ types: ["FIRE"], routing: "EMERGENCY" }),
    ).toBe(true);
  });
});

describe("parseAospEccText", () => {
  it("parses a minimal country block", () => {
    const source = `
revision: 2
countries {
  iso_code: "US"
  eccs {
    phone_number: "911"
    types: POLICE
    types: AMBULANCE
    types: FIRE
  }
}
`;
    const parsed = parseAospEccText(source);
    expect(parsed.revision).toBe(2);
    expect(parsed.countries).toHaveLength(1);
    expect(parsed.countries[0]?.isoCode).toBe("US");
    expect(parsed.countries[0]?.eccRows[0]?.phoneNumber).toBe("911");
  });
});
