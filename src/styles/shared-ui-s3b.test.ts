import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const S3B_SCSS = [
  "components/ui/Button/Button.module.scss",
  "components/ui/Input/Input.module.scss",
  "components/ui/Textarea/Textarea.module.scss",
  "components/ui/Select/Select.module.scss",
  "components/ui/Field/Field.module.scss",
  "components/ui/Card/Card.module.scss",
  "components/ui/Badge/Badge.module.scss",
  "components/ui/BottomNav/BottomNav.module.scss",
  "components/ui/AppHeader/AppHeader.module.scss",
  "features/app-shell/TripShellLayout.module.scss",
  "features/app-shell/TripHeader.module.scss",
  "features/app-shell/TripPrimaryNav.module.scss",
  "features/app-shell/GlobalAppShell.module.scss",
  "features/app-shell/AppPage.module.scss",
  "features/quick-add/QuickAdd.module.scss",
];

describe("S3B shared UI + trip shell token alignment", () => {
  it("keeps S3B SCSS free of legacy burgundy/cream hex values", () => {
    for (const file of S3B_SCSS) {
      const source = read(file);
      expect(source.toLowerCase()).not.toContain("#7a2e38");
      expect(source.toLowerCase()).not.toContain("#f3eee6");
      expect(source.toLowerCase()).not.toContain("#fbf7f1");
    }
  });

  it("aligns Quick Add mobile sheet to semantic tokens", () => {
    const styles = read("features/quick-add/QuickAdd.module.scss");
    expect(styles).toContain("--color-surface-elevated");
    expect(styles).toContain("--color-scrim");
    expect(styles).toContain("mobileSheetRoot");

    const host = read("features/quick-add/QuickAddHost.client.tsx");
    expect(host).toContain("mobileSheetRoot");
    expect(host).not.toContain("DayPage.module.scss");
  });

  it("uses primary-soft for rail active selection", () => {
    const nav = read("components/ui/BottomNav/BottomNav.module.scss");
    expect(nav).toContain("var(--color-primary-soft)");
  });

  it("does not introduce trip theme hooks", () => {
    const shell = read("features/app-shell/TripShellLayout.module.scss");
    expect(shell).not.toContain("data-trip-theme");
    expect(shell).not.toContain("themeKey");
  });
});
