import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseActivityEntityCostFromFormData } from "@/features/finance/entity-cost-schema";
import { getDayActionSurfaceTitle } from "./day-action-menu";
import { emptyActivityFormValues, toActivityFormValues } from "./to-activity-view-model";
import { createActivitySchema, parseActivityFieldsFromFormData } from "./schemas";
import { shouldActivityUsePlaceImage } from "./should-activity-use-place-image";
import type { ActivityViewModel } from "./types";

const validTripId = "507f1f77bcf86cd799439011";

describe("activity form flow", () => {
  it("uses create and edit overlay titles with day context helper", () => {
    expect(getDayActionSurfaceTitle({ kind: "menu" })).toBe("הוספה ליום");
    expect(getDayActionSurfaceTitle({ kind: "activity-create" })).toBe(
      "הוספת פעילות",
    );
    expect(getDayActionSurfaceTitle({ kind: "activity-edit" })).toBe("עריכת פעילות");
  });

  it("inherits canonical day via hidden date on locked create forms", () => {
    const defaults = emptyActivityFormValues({
      date: "2026-10-27",
      type: "attraction",
    });
    expect(defaults.date).toBe("2026-10-27");

    const formData = new FormData();
    formData.set("title", "Morning walk");
    formData.set("type", "freeTime");
    formData.set("date", "2026-10-27");
    formData.set("placeSource", "manual");
    formData.set("startTime", "10:00");

    const parsed = parseActivityFieldsFromFormData(formData);
    const result = createActivitySchema.safeParse({
      tripId: validTripId,
      ...parsed,
    });
    expect(result.success).toBe(true);
  });

  it("allows quick create with title only and no place or cost", () => {
    const formData = new FormData();
    formData.set("title", "Rest");
    formData.set("type", "freeTime");
    formData.set("date", "2026-10-27");
    formData.set("placeSource", "manual");

    const parsed = parseActivityFieldsFromFormData(formData);
    expect(createActivitySchema.safeParse({ tripId: validTripId, ...parsed }).success).toBe(
      true,
    );
    const costParsed = parseActivityEntityCostFromFormData(formData);
    expect(costParsed.ok).toBe(true);
    if (costParsed.ok) {
      expect(costParsed.value.hasCost).toBe(false);
    }
  });

  it("preserves google place parsing and manual mode", () => {
    const googleForm = new FormData();
    googleForm.set("title", "TeamLab");
    googleForm.set("type", "attraction");
    googleForm.set("date", "2026-10-27");
    googleForm.set("placeSource", "google");
    googleForm.set("googlePlaceId", "ChIJN1t_tDeuEmsRUsoyG83frY4");
    googleForm.set("locationName", "TeamLab Planets");
    googleForm.set("latitude", "35.649");
    googleForm.set("longitude", "139.789");

    const googleParsed = parseActivityFieldsFromFormData(googleForm);
    expect(googleParsed.placeSource).toBe("google");
    expect(googleParsed.locationName).toBe("TeamLab Planets");

    const manualForm = new FormData();
    manualForm.set("title", "Hotel lobby");
    manualForm.set("type", "other");
    manualForm.set("date", "2026-10-27");
    manualForm.set("placeSource", "manual");
    manualForm.set("locationName", "Lobby");
    const manualParsed = parseActivityFieldsFromFormData(manualForm);
    expect(manualParsed.placeSource).toBe("manual");
  });

  it("preserves linked cost create/edit parsing with original currency", () => {
    const formData = new FormData();
    formData.set("costAmount", "4200");
    formData.set("costCurrency", "JPY");
    formData.set("costCategory", "activities");

    const parsed = parseActivityEntityCostFromFormData(formData);
    expect(parsed.ok).toBe(true);
    if (parsed.ok && parsed.value.hasCost) {
      expect(parsed.value.currency).toBe("JPY");
      expect(parsed.value.amount).toBe(4200);
      expect(parsed.value.category).toBe("activities");
    }
  });

  it("prepopulates edit values including place and cost metadata", () => {
    const activity: ActivityViewModel = {
      id: "a1",
      date: "2026-10-27",
      title: "Museum",
      type: "attraction",
      typeLabel: "אטרקציה",
      order: 0,
      placeSource: "google",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      locationName: "Museum",
      city: "Tokyo",
      country: "Japan",
      latitude: 35.6,
      longitude: 139.7,
      linkedCost: {
        label: "¥4,200",
        amount: 4200,
        currency: "JPY",
        category: "activities",
      },
      notes: "Book online",
    };

    const values = toActivityFormValues(activity);
    expect(values.title).toBe("Museum");
    expect(values.googlePlaceId).toBeTruthy();
    expect(values.notes).toBe("Book online");
    expect(activity.linkedCost?.currency).toBe("JPY");
  });

  it("does not manage PlaceImage from the activity form", () => {
    expect(shouldActivityUsePlaceImage).toBeDefined();
    const root = join(dirname(fileURLToPath(import.meta.url)), ".");
    const formSource = readFileSync(join(root, "ActivityForm.tsx"), "utf8");
    const locationSource = readFileSync(join(root, "ActivityLocationSection.tsx"), "utf8");
    expect(formSource.toLowerCase()).not.toMatch(/placeimage|photo|upload/);
    expect(locationSource.toLowerCase()).not.toMatch(/placeimage|upload/);
  });

  it("preserves mobile sheet and desktop dialog architecture hooks", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), ".");
    const surfaceSource = readFileSync(join(root, "DayActionSurface.client.tsx"), "utf8");
    const overlaySource = readFileSync(join(root, "ActivityAddOverlay.client.tsx"), "utf8");
    expect(surfaceSource).toContain("sheetPanelForm");
    expect(surfaceSource).toContain("formatActivityFormDayContext");
    expect(overlaySource).toContain("ActivityAddOverlay");
  });
});
