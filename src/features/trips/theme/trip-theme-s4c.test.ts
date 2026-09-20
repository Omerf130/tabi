import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import enMessages from "../../../../messages/en.json";
import heMessages from "../../../../messages/he.json";
import { UNKNOWN_TRIP_TRAVEL_LANGUAGE_FIELDS } from "@/features/trips/public-trip";
import { buildAppearanceSettingsHref } from "@/features/settings/constants";
import { buildSettingsHubViewModel } from "@/features/settings/build-settings-hub-view-model";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import {
  TRIP_THEME_REGISTRY,
  isTripThemeSelectable,
  listSelectableTripThemes,
} from "./trip-theme-registry";
import { updateTripThemeSchema } from "./update-trip-theme-schema";
import { updateTripThemeAction } from "./update-trip-theme-action";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const tripId = "507f1f77bcf86cd799439011";

const {
  requireTripOwnerMock,
  tripFindByIdAndUpdateMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  requireTripOwnerMock: vi.fn(),
  tripFindByIdAndUpdateMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(async () => undefined),
}));

vi.mock("@/models/Trip", () => ({
  Trip: {
    findByIdAndUpdate: tripFindByIdAndUpdateMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

describe("S4C Trip theme settings + owner selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({
      id: tripId,
      role: "owner",
      themeKey: "default",
    });
    tripFindByIdAndUpdateMock.mockResolvedValue({ _id: tripId });
  });

  it("exposes the Appearance settings route and hub link", () => {
    expect(buildAppearanceSettingsHref(tripId)).toBe(
      `/app/trips/${tripId}/manage/appearance`,
    );
    expect(read("app/app/trips/[tripId]/manage/appearance/page.tsx")).toContain(
      "AppearanceSettingsContent",
    );

    const model = buildSettingsHubViewModel({
      trip: {
        id: tripId,
        name: "Trip",
        startDate: "2026-01-01",
        endDate: "2026-01-07",
        role: "owner",
        themeKey: "default",
        destinationCalendarTimeZone: "UTC",
        ...UNKNOWN_TRIP_TRAVEL_LANGUAGE_FIELDS,
      },
      isOwner: true,
      baseCurrency: "ILS",
      locale: "en",
      t: createAppTranslator("Settings", "en"),
    });
    const themeRow = model.sections
      .flatMap((section) => section.rows)
      .find((row) => row.id === "theme");
    expect(themeRow?.href).toBe(buildAppearanceSettingsHref(tripId));
    expect(themeRow?.comingSoon).toBe(false);
  });

  it("uses registry enabled flag as the single selectable source of truth", () => {
    const selectable = listSelectableTripThemes().map((theme) => theme.key);
    expect(selectable).toEqual([
      "default",
      "ocean",
      "sakura",
      "forest",
      "sunset",
    ]);
    expect(isTripThemeSelectable("sakura")).toBe(true);
    expect(TRIP_THEME_REGISTRY.filter((t) => t.enabled)).toHaveLength(5);
  });

  it("includes HE/EN TripTheme messages without palette hex in registry", () => {
    expect(enMessages.TripTheme.themes.ocean.name).toBe("Ocean");
    expect(heMessages.TripTheme.themes.ocean.name).toBe("אוקיינוס");
    for (const theme of TRIP_THEME_REGISTRY) {
      expect(JSON.stringify(theme)).not.toMatch(/#[0-9a-f]{3,8}/i);
    }
  });

  it("owner action updates default to ocean and revalidates trip layout", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("themeKey", "ocean");

    const result = await updateTripThemeAction({}, formData);
    expect(result.ok).toBe(true);
    expect(requireTripOwnerMock).toHaveBeenCalledWith(tripId);
    expect(tripFindByIdAndUpdateMock).toHaveBeenCalledWith(
      tripId,
      { $set: { themeKey: "ocean" } },
      { runValidators: true },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/app/trips/${tripId}`,
      "layout",
    );
  });

  it("owner action updates ocean to default", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("themeKey", "default");

    const result = await updateTripThemeAction({}, formData);
    expect(result.ok).toBe(true);
    expect(tripFindByIdAndUpdateMock).toHaveBeenCalledWith(
      tripId,
      { $set: { themeKey: "default" } },
      { runValidators: true },
    );
  });

  it("does not update when requireTripOwner fails", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("forbidden"));
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("themeKey", "ocean");
    const result = await updateTripThemeAction({}, formData);
    expect(result.errorCode).toBe("generic");
    expect(tripFindByIdAndUpdateMock).not.toHaveBeenCalled();
  });

  it("accepts all five selectable themes and rejects invalid keys", async () => {
    for (const themeKey of [
      "sakura",
      "forest",
      "sunset",
    ] as const) {
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("themeKey", themeKey);
      const result = await updateTripThemeAction({}, formData);
      expect(result.ok).toBe(true);
    }

    const invalid = updateTripThemeSchema.safeParse({
      tripId,
      themeKey: "burgundy",
    });
    expect(invalid.success).toBe(false);
  });

  it("does not mutate cover or user layers from theme action", () => {
    const actionSource = read("features/trips/theme/update-trip-theme-action.ts");
    expect(actionSource).toContain('"use server"');
    expect(actionSource).not.toMatch(/export const TRIP_THEME_ERROR_CODES/);
    expect(actionSource).not.toContain("coverVisualKey");
    expect(actionSource).not.toContain("User");
    const client = read("features/settings/appearance/AppearanceSettings.client.tsx");
    expect(client).not.toContain("localStorage");
    expect(client).not.toContain("document.");
  });

  it("uses CSS preview selectors only in Appearance settings styles", () => {
    const appearanceStyles = read(
      "features/settings/appearance/AppearanceSettings.module.scss",
    );
    for (const key of [
      "default",
      "ocean",
      "sakura",
      "forest",
      "sunset",
    ] as const) {
      expect(appearanceStyles).toContain(`[data-preview-theme="${key}"]`);
    }
    expect(appearanceStyles).not.toContain("[data-trip-theme");
  });
});
