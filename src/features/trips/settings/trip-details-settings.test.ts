import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import heMessages from "../../../../messages/he.json";
import enMessages from "../../../../messages/en.json";
import { resolveManageBackHref } from "@/features/app-shell/TripManageHeader";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import { buildTripDetailsSettingsHref } from "@/features/settings/constants";
import { buildTripManagementHref } from "@/features/trip-management/constants";
import {
  updateTripDestinationSchema,
  updateTripIdentitySchema,
} from "@/features/trips/schemas";
import {
  updateTripDestinationAction,
  updateTripIdentityAction,
} from "@/features/trips/settings/trip-details-actions";

const tripId = "507f1f77bcf86cd799439011";

const {
  updateTripIdentityMock,
  updateTripDestinationMock,
  requireTripOwnerMock,
} = vi.hoisted(() => ({
  updateTripIdentityMock: vi.fn(),
  updateTripDestinationMock: vi.fn(),
  requireTripOwnerMock: vi.fn(),
}));

vi.mock("@/features/trips/update-trip-details", () => ({
  updateTripIdentity: updateTripIdentityMock,
  updateTripDestination: updateTripDestinationMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

describe("Trip Details settings", () => {
  it("exposes Hebrew and English TripDetailsSettings messages", () => {
    expect(enMessages.TripDetailsSettings.pageTitle).toBe("Trip details");
    expect(heMessages.TripDetailsSettings.pageTitle).toBe("פרטי הטיול");
    expect(heMessages.TripDetailsSettings.destinationPreserveNotice).toContain("יעד");
    expect(enMessages.TripDetailsSettings.dateChange.editDates).toBe(
      "Edit trip dates",
    );
    expect(heMessages.TripDetailsSettings.dateChange.editDates).toBe(
      "עריכת תאריכי הטיול",
    );
    expect(enMessages.TripDetailsSettings.travelers.subtitle).toBeDefined();
  });

  it("uses the canonical /manage/details route", () => {
    expect(buildTripDetailsSettingsHref(tripId)).toBe(
      buildTripManagementHref(tripId, "details"),
    );
  });

  it("keeps Settings nav active on trip details", () => {
    const path = buildTripDetailsSettingsHref(tripId);
    expect(getActiveNavSection(path, tripId)).toBe("settings");
    expect(getActiveNavSection(path, tripId)).not.toBe("more");
  });

  it("routes Trip Details header back to the settings hub", () => {
    const detailsPath = buildTripDetailsSettingsHref(tripId);
    expect(resolveManageBackHref(detailsPath, tripId)).toBe(
      `/app/trips/${tripId}/manage`,
    );
    expect(resolveManageBackHref(`/app/trips/${tripId}/manage`, tripId)).toBe(
      `/app/trips/${tripId}/more`,
    );
  });

  it("routes Travelers header back to the settings hub", () => {
    const travelersPath = `/app/trips/${tripId}/manage/members`;
    expect(resolveManageBackHref(travelersPath, tripId)).toBe(
      `/app/trips/${tripId}/manage`,
    );
  });

  it("does not render details through the legacy section page switch", () => {
    const sectionPagePath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/[section]/page.tsx",
    );
    const source = readFileSync(sectionPagePath, "utf8");
    expect(source).not.toContain('case "details"');
    expect(source).not.toContain("TripManagementShell");
  });

  it("uses a dedicated static details page without TripManagementShell", () => {
    const detailsPagePath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/details/page.tsx",
    );
    const source = readFileSync(detailsPagePath, "utf8");
    expect(source).toContain("TripDetailsSettingsContent");
    expect(source).not.toContain("TripManagementShell");
  });

  it("validates identity updates without date fields", () => {
    const parsed = updateTripIdentitySchema.safeParse({
      tripId,
      name: "Japan",
      description: "",
    });
    expect(parsed.success).toBe(true);
    expect(Object.keys(parsed.success ? parsed.data : {})).not.toContain("startDate");
  });

  it("rejects identity updates with invalid names", () => {
    const parsed = updateTripIdentitySchema.safeParse({
      tripId,
      name: "J",
      description: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("validates destination updates with googlePlaceId only", () => {
    const parsed = updateTripDestinationSchema.safeParse({
      tripId,
      googlePlaceId: "ChIJOwg_06VPwokRYv534QaPC8g",
    });
    expect(parsed.success).toBe(true);
    expect(Object.keys(parsed.success ? parsed.data : {})).not.toContain("startDate");
  });

  it("calls domain on successful identity action", async () => {
    updateTripIdentityMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("name", "New name");
    formData.set("description", "Desc");

    const result = await updateTripIdentityAction({}, formData);
    expect(result.ok).toBe(true);
    expect(updateTripIdentityMock).toHaveBeenCalledWith({
      tripId,
      name: "New name",
      description: "Desc",
    });
  });

  it("returns generic error when domain rejects member updates", async () => {
    updateTripIdentityMock.mockRejectedValue(new Error("not found"));
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("name", "New name");
    formData.set("description", "");

    const result = await updateTripIdentityAction({}, formData);
    expect(result.ok).toBeUndefined();
    expect(result.error).toBe("generic");
  });

  it("calls domain on successful destination action", async () => {
    updateTripDestinationMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("googlePlaceId", "ChIJOwg_06VPwokRYv534QaPC8g");

    const result = await updateTripDestinationAction({}, formData);
    expect(result.ok).toBe(true);
    expect(updateTripDestinationMock).toHaveBeenCalledWith({
      tripId,
      googlePlaceId: "ChIJOwg_06VPwokRYv534QaPC8g",
    });
  });
});
