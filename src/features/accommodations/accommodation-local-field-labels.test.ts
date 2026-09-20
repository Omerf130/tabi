import { describe, expect, it } from "vitest";
import {
  resolveAccommodationLocalFieldLang,
  resolveAccommodationLocalFieldMessageKeys,
} from "./accommodation-local-field-labels";

describe("resolveAccommodationLocalFieldMessageKeys", () => {
  it("uses Japanese labels for JP", () => {
    expect(resolveAccommodationLocalFieldMessageKeys("JP").nameLabelKey).toBe("nameJapanese");
  });

  it("uses Korean labels for KR", () => {
    const keys = resolveAccommodationLocalFieldMessageKeys("KR");
    expect(keys.nameLabelKey).toBe("nameKorean");
    expect(keys.addressLabelKey).toBe("addressKorean");
  });

  it("uses neutral local labels for other destinations", () => {
    const keys = resolveAccommodationLocalFieldMessageKeys("IT");
    expect(keys.nameLabelKey).toBe("localName");
    expect(keys.addressLabelKey).toBe("localAddress");
  });
});

describe("resolveAccommodationLocalFieldLang", () => {
  it("resolves ja and ko from country", () => {
    expect(resolveAccommodationLocalFieldLang("JP")).toBe("ja");
    expect(resolveAccommodationLocalFieldLang("KR")).toBe("ko");
  });

  it("returns undefined for unknown destinations", () => {
    expect(resolveAccommodationLocalFieldLang("IT")).toBeUndefined();
    expect(resolveAccommodationLocalFieldLang(null)).toBeUndefined();
  });
});
