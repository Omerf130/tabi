import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const S3F_SCSS = [
  "features/welcome/WelcomeScreen.module.scss",
  "features/auth/AuthPageShell.module.scss",
  "features/auth/AuthForm.module.scss",
  "features/auth/AuthField.module.scss",
  "features/auth/AuthDivider.module.scss",
  "features/auth/GoogleSignInButton.module.scss",
  "features/my-trips/MyTripsScreen.module.scss",
  "features/create-trip/CreateTripWizard.module.scss",
  "features/create-trip/TripDateRangeCalendar.module.scss",
  "features/account/AccountShell.module.scss",
  "features/account/Profile.module.scss",
  "features/account/UserAvatar.module.scss",
] as const;

const GLOBAL_PRE_TRIP_ROUTE_FILES = [
  "app/page.tsx",
  "app/login/page.tsx",
  "app/register/page.tsx",
  "app/app/page.tsx",
  "app/app/trips/page.tsx",
  "app/app/trips/new/page.tsx",
  "app/app/account/profile/page.tsx",
] as const;

describe("S3F global / pre-trip token migration", () => {
  it("maps Welcome and global shells to semantic primary/background tokens", () => {
    const welcome = read("features/welcome/WelcomeScreen.module.scss");
    expect(welcome).toContain("background: var(--color-primary)");
    expect(welcome).toContain("--welcome-cta-text: var(--color-text)");

    const authShell = read("features/auth/AuthPageShell.module.scss");
    expect(authShell).toContain("--auth-primary: var(--color-primary)");
    expect(authShell).toContain("background: var(--color-primary)");
    expect(authShell).not.toContain("#1a3f7a");
  });

  it("maps My Trips aliases to semantic globals", () => {
    const myTrips = read("features/my-trips/MyTripsScreen.module.scss");
    expect(myTrips).toContain("--my-trips-text: var(--color-text)");
    expect(myTrips).toContain("--my-trips-surface: var(--color-background)");
    expect(myTrips).toContain("--my-trips-primary: var(--color-primary)");
  });

  it("maps Create Trip wizard structural aliases to semantic globals", () => {
    const wizard = read("features/create-trip/CreateTripWizard.module.scss");
    expect(wizard).toContain("--wizard-primary: var(--color-primary)");
    expect(wizard).toContain("--wizard-surface: var(--color-background)");
    expect(wizard).toContain("--wizard-danger: var(--color-danger)");
    expect(wizard).toContain("color: var(--color-on-primary)");
    expect(wizard).not.toMatch(/background:\s*#f8f9fb/i);

    const calendar = read("features/create-trip/TripDateRangeCalendar.module.scss");
    expect(calendar).toMatch(/--cal-text:\s*var\(--color-text\)/);
  });

  it("keeps S3F SCSS free of legacy burgundy/cream structural hex", () => {
    for (const file of S3F_SCSS) {
      const source = read(file).toLowerCase();
      expect(source, file).not.toContain("#7a2e38");
      expect(source, file).not.toContain("#f3eee6");
      expect(source, file).not.toContain("#fbf7f1");
      expect(source, file).not.toContain("#ddd4c8");
    }
  });

  it("does not introduce trip theme hooks in S3F scope", () => {
    for (const file of S3F_SCSS) {
      const source = read(file);
      expect(source, file).not.toContain("data-trip-theme");
      expect(source, file).not.toContain("themeKey");
    }
  });

  it("keeps global/pre-trip routes outside TripShellLayout", () => {
    const tripShellLayoutSource = read("app/app/trips/[tripId]/layout.tsx");
    expect(tripShellLayoutSource).toContain("TripShellLayout");

    for (const routeFile of GLOBAL_PRE_TRIP_ROUTE_FILES) {
      const source = read(routeFile);
      expect(source, routeFile).not.toContain("TripShellLayout");
    }
  });

  it("Auth primary CTA uses global primary, not a separate auth brand hex", () => {
    const form = read("features/auth/AuthForm.module.scss");
    expect(form).toContain("background: var(--auth-primary)");
    expect(form).toContain("color: var(--color-on-primary)");
  });
});
