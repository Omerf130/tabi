import { describe, expect, it } from "vitest";
import enMessages from "../../../messages/en.json";
import heMessages from "../../../messages/he.json";
import { buildTripNavHref, NAV_SECTIONS } from "./navigation";

const TRIP_ID = "507f1f77bcf86cd799439011";

describe("shell i18n messages", () => {
  it("defines Hebrew navigation labels", () => {
    expect(heMessages.Navigation).toEqual({
      home: "בית",
      itinerary: "מסלול",
      documents: "מסמכים",
      settings: "הגדרות",
      more: "עוד",
      ariaLabel: "ניווט ראשי",
    });
  });

  it("defines English navigation labels", () => {
    expect(enMessages.Navigation.home).toBe("Home");
    expect(enMessages.Navigation.settings).toBe("Settings");
    expect(enMessages.Navigation.more).toBe("More");
  });

  it("keeps language-independent hrefs", () => {
    expect(buildTripNavHref(TRIP_ID, "home")).toBe(`/app/trips/${TRIP_ID}`);
    expect(buildTripNavHref(TRIP_ID, "settings")).toBe(
      `/app/trips/${TRIP_ID}/manage`,
    );
    expect(buildTripNavHref(TRIP_ID, "more")).toBe(
      `/app/trips/${TRIP_ID}/more`,
    );
  });

  it("keeps Settings as the fourth primary nav destination", () => {
    expect(NAV_SECTIONS).toEqual([
      "home",
      "itinerary",
      "documents",
      "settings",
      "more",
    ]);
  });
});
