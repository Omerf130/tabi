import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { formatAccommodationDeleteConfirm } from "./accommodation-labels";

describe("accommodation labels", () => {
  it("formats delete confirmation with hotel-booking disclaimer", () => {
    const t = createAppTranslator("Accommodation", "he");
    expect(formatAccommodationDeleteConfirm(t)).toBe(
      "למחוק את מקום הלינה הזה מהטיול?\n\nפעולה זו מסירה את מקום הלינה מ-Tabi בלבד — היא לא מבטלת את ההזמנה בבית המלון.",
    );
  });
});
