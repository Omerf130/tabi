import { describe, expect, it } from "vitest";
import {
  assertMemberTravelersPayloadHasNoEmails,
  buildTravelersSettingsViewModel,
} from "./build-travelers-settings-view-model";

describe("buildTravelersSettingsViewModel", () => {
  const members = [
    {
      membershipId: "m1",
      userId: "u1",
      name: "Alex",
      email: "alex@example.com",
      role: "owner" as const,
      joinedAt: "2026-01-01",
      hasProfileImage: true,
    },
    {
      membershipId: "m2",
      userId: "u2",
      name: "Blake",
      email: "blake@example.com",
      role: "member" as const,
      joinedAt: "2026-01-02",
      hasProfileImage: false,
    },
  ];

  it("exposes avatarHref only when the member has a profile image", () => {
    const model = buildTravelersSettingsViewModel({
      tripId: "trip1",
      isOwner: true,
      currentUserId: "u1",
      members,
      activeInvitations: [],
    });
    if (model.isOwner) {
      expect(model.travelers[0].avatarHref).toBe("/app/users/u1/profile-image");
      expect(model.travelers[1].avatarHref).toBeUndefined();
    }
  });

  it("includes email on owner-facing traveler rows", () => {
    const model = buildTravelersSettingsViewModel({
      tripId: "trip1",
      isOwner: true,
      currentUserId: "u1",
      members,
      activeInvitations: [],
    });
    expect(model.isOwner).toBe(true);
    if (model.isOwner) {
      expect(model.travelers[1].email).toBe("blake@example.com");
    }
  });

  it("omits email from member-facing traveler rows", () => {
    const model = buildTravelersSettingsViewModel({
      tripId: "trip1",
      isOwner: false,
      currentUserId: "u2",
      members,
    });
    expect(model.isOwner).toBe(false);
    if (!model.isOwner) {
      assertMemberTravelersPayloadHasNoEmails(model);
      for (const traveler of model.travelers) {
        expect(traveler).not.toHaveProperty("email");
      }
    }
  });

  it("does not attach invitations to member view model", () => {
    const model = buildTravelersSettingsViewModel({
      tripId: "trip1",
      isOwner: false,
      currentUserId: "u2",
      members,
    });
    expect("activeInvitations" in model).toBe(false);
  });
});
