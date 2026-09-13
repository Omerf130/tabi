import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { buildTransportListTitle } from "./build-transport-list-title";

describe("buildTransportListTitle", () => {
  const tHe = createAppTranslator("Transport", "he");
  const tEn = createAppTranslator("Transport", "en");

  it("derives destination-based titles from real arrival names", () => {
    expect(buildTransportListTitle("flight", "Tokyo", tHe)).toBe("טיסה לTokyo");
    expect(buildTransportListTitle("train", "Osaka", tHe)).toBe("רכבת לOsaka");
    expect(buildTransportListTitle("bus", "Kyoto", tHe)).toBe("אוטובוס לKyoto");
    expect(buildTransportListTitle("ferry", "Miyajima", tHe)).toBe("מעבורת לMiyajima");
    expect(buildTransportListTitle("taxi", "Shinjuku", tHe)).toBe("מונית לShinjuku");
    expect(buildTransportListTitle("flight", "Tokyo", tEn)).toBe("Flight to Tokyo");
  });

  it("uses stable car labels", () => {
    expect(buildTransportListTitle("car", "Osaka", tHe)).toBe("רכב שכור · Osaka");
    expect(buildTransportListTitle("car", "", tHe)).toBe("רכב שכור");
    expect(buildTransportListTitle("car", "Osaka", tEn)).toBe("Rental car · Osaka");
  });

  it("falls back when destination is missing", () => {
    expect(buildTransportListTitle("flight", "  ", tHe)).toBe("טיסה");
    expect(buildTransportListTitle("train", "", tHe)).toBe("רכבת");
  });
});
