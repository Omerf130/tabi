import { describe, expect, it } from "vitest";
import { buildTaxiModeContent } from "./build-taxi-mode-content";

const MISSING_ADDRESS_MESSAGE =
  "No address on file. Add an address in trip settings.";

describe("buildTaxiModeContent", () => {
  it("shows Japanese name and address prominently when available", () => {
    const content = buildTaxiModeContent(
      {
        name: "Hotel Gracery",
        nameJapanese: "ホテルグレイスリー",
        addressJapanese: "東京都新宿区歌舞伎町1-19-1",
        addressEnglish: "1-19-1 Kabukicho",
      },
      MISSING_ADDRESS_MESSAGE,
    );

    expect(content.primaryName).toBe("ホテルグレイスリー");
    expect(content.primaryNameLang).toBe("ja");
    expect(content.secondaryName).toBe("Hotel Gracery");
    expect(content.primaryAddress).toBe("東京都新宿区歌舞伎町1-19-1");
    expect(content.primaryAddressLang).toBe("ja");
    expect(content.secondaryAddress).toBe("1-19-1 Kabukicho");
    expect(content.missingAddressMessage).toBeUndefined();
    expect(content.showJapaneseHierarchy).toBe(true);
  });

  it("uses stored Hebrew name when no Japanese name", () => {
    const content = buildTaxiModeContent(
      {
        name: "מלון בקyoto",
        addressEnglish: "123 Main St",
      },
      MISSING_ADDRESS_MESSAGE,
    );

    expect(content.primaryName).toBe("מלון בקyoto");
    expect(content.primaryNameLang).toBe("he");
    expect(content.secondaryName).toBeUndefined();
    expect(content.showJapaneseHierarchy).toBe(false);
  });

  it("does not fabricate Japanese content", () => {
    const content = buildTaxiModeContent(
      {
        name: "Kyoto Hotel",
        addressEnglish: "123 Main St",
      },
      MISSING_ADDRESS_MESSAGE,
    );

    expect(content.primaryName).toBe("Kyoto Hotel");
    expect(content.secondaryName).toBeUndefined();
    expect(content.primaryAddressLang).toBe("en");
  });

  it("shows missing-address message when address is absent", () => {
    const content = buildTaxiModeContent(
      {
        name: "Hotel",
        nameJapanese: "ホテル",
      },
      MISSING_ADDRESS_MESSAGE,
    );

    expect(content.missingAddressMessage).toBe(MISSING_ADDRESS_MESSAGE);
  });

  it("prefers Japanese address when no Japanese name but Japanese address exists", () => {
    const content = buildTaxiModeContent(
      {
        name: "Hotel",
        addressJapanese: "東京都",
        addressEnglish: "Tokyo",
      },
      MISSING_ADDRESS_MESSAGE,
    );

    expect(content.primaryAddress).toBe("東京都");
    expect(content.primaryAddressLang).toBe("ja");
    expect(content.secondaryAddress).toBe("Tokyo");
  });
});
