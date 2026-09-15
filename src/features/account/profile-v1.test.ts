import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import heMessages from "../../../messages/he.json";
import enMessages from "../../../messages/en.json";

const root = join(process.cwd(), "src");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("Profile V1 route and shell", () => {
  it("uses authenticated profile content without trip shell", () => {
    const page = readSource("app/app/account/profile/page.tsx");
    const content = readSource("features/account/ProfileContent.tsx");
    expect(page).toContain("ProfileContent");
    expect(content).toContain("requireUser");
    expect(content).not.toContain("requireTripMember");
    expect(content).not.toContain("TripShellLayout");
    expect(content).toContain("AccountShell");
  });

  it("profile image route checks shared membership", () => {
    const route = readSource("app/app/users/[userId]/profile-image/route.ts");
    expect(route).toContain("requireUser");
    expect(route).toContain("usersShareTripMembership");
    expect(route).not.toContain("profileImage?.url");
  });
});

describe("Profile UI integration", () => {
  it("reuses logoutAction and preference actions", () => {
    const profile = readSource("features/account/Profile.client.tsx");
    expect(profile).toContain("logoutAction");
    expect(profile).toContain("updateUserHomeCurrencyAction");
    expect(profile).toContain("InterfaceLanguagePreference");
    expect(profile).toContain("PreferredMapsAppPreference");
    expect(profile).not.toContain("/manage/language");
    expect(profile).not.toContain("/manage/currency");
    expect(profile).not.toContain("/manage/maps");
  });

  it("uses conditional sheets for editors", () => {
    const profile = readSource("features/account/Profile.client.tsx");
    expect(profile).toContain("nameSheetOpen ?");
    expect(profile).toContain("currencySheetOpen ?");
  });

  it("integrates UserAvatar in travelers settings", () => {
    const travelers = readSource(
      "features/trips/settings/travelers/TravelersSettings.client.tsx",
    );
    expect(travelers).toContain("UserAvatar");
    expect(travelers).toContain("avatarHref");
  });

  it("links My Trips account menu to profile", () => {
    const account = readSource("features/my-trips/MyTripsAccountAffordance.tsx");
    expect(account).toContain("buildProfileHrefWithReturnTo");
    expect(account).toContain("profile");
  });
});

describe("Profile i18n", () => {
  it("includes Profile namespace in HE and EN", () => {
    expect(enMessages.Profile.title).toBe("Profile");
    expect(heMessages.Profile.title).toBe("פרופיל");
    expect(enMessages.Profile.errors.tooLarge).toContain("5 MB");
  });

  it("keeps email read-only in UI without update action", () => {
    const profile = readSource("features/account/Profile.client.tsx");
    expect(profile).toContain('dir="ltr"');
    expect(profile).not.toContain("updateUserEmail");
    expect(readSource("features/account/actions/update-user-name.ts")).not.toContain(
      "email",
    );
  });
});
