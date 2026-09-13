import { describe, expect, it } from "vitest";
import { buildTransportListTitle } from "./build-transport-list-title";

describe("buildTransportListTitle", () => {
  it("derives destination-based titles from real arrival names", () => {
    expect(buildTransportListTitle("flight", "Tokyo")).toBe("טיסה לTokyo");
    expect(buildTransportListTitle("train", "Osaka")).toBe("רכבת לOsaka");
    expect(buildTransportListTitle("bus", "Kyoto")).toBe("אוטובוס לKyoto");
    expect(buildTransportListTitle("ferry", "Miyajima")).toBe("מעבורת לMiyajima");
    expect(buildTransportListTitle("taxi", "Shinjuku")).toBe("מונית לShinjuku");
  });

  it("uses stable car labels", () => {
    expect(buildTransportListTitle("car", "Osaka")).toBe("רכב שכור · Osaka");
    expect(buildTransportListTitle("car", "")).toBe("רכב שכור");
  });

  it("falls back when destination is missing", () => {
    expect(buildTransportListTitle("flight", "  ")).toBe("טיסה");
    expect(buildTransportListTitle("train", "")).toBe("רכבת");
  });
});
