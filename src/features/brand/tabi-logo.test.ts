import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TABI_LOGO_SRC } from "./tabi-logo.constants";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

describe("Tabi official logo integration", () => {
  it("uses the canonical logo asset path", () => {
    expect(TABI_LOGO_SRC).toBe(
      "/logo/WhatsApp_Image_2026-09-11_at_16.39.22-removebg-preview.png",
    );
    expect(readSource("features/brand/TabiLogo.tsx")).toContain("TABI_LOGO_SRC");
    expect(readSource("features/brand/tabi-logo.constants.ts")).toContain(TABI_LOGO_SRC);
  });

  it("Welcome uses shared hero logo without duplicate wordmark text", () => {
    const welcome = readSource("features/welcome/WelcomeScreen.tsx");
    expect(welcome).toContain("TabiLogo");
    expect(welcome).toContain('variant="hero"');
    expect(welcome).not.toContain("TabiBrandMark");
    expect(welcome).not.toContain("styles.brandName");
  });

  it("Auth shell uses shared logo branding", () => {
    const auth = readSource("features/auth/AuthPageShell.tsx");
    expect(auth).toContain("TabiLogo");
    expect(auth).toContain('variant="auth"');
    expect(auth).toContain('tone="light"');
    expect(auth).not.toContain("TabiBrandMark");
    expect(auth).not.toContain("styles.brandName");
  });

  it("TabiLogo supports light tone for dark atmospheric backgrounds", () => {
    const logoTsx = readSource("features/brand/TabiLogo.tsx");
    const logoScss = readSource("features/brand/TabiLogo.module.scss");
    expect(logoTsx).toContain('tone?: TabiLogoTone');
    expect(logoTsx).toContain('"light"');
    expect(logoScss).toContain(".toneLight");
    expect(logoScss).toMatch(/brightness\(0\)\s*invert\(1\)/);
  });

  it("Welcome uses light logo on atmospheric background", () => {
    const welcome = readSource("features/welcome/WelcomeScreen.tsx");
    expect(welcome).toContain('tone="light"');
  });

  it("light-surface logo usages stay on default tone", () => {
    const offline = readSource("app/offline/page.tsx");
    const nav = readSource("features/app-shell/TripPrimaryNav.tsx");
    expect(offline).toContain("TabiLogo");
    expect(offline).not.toContain('tone="light"');
    expect(nav).toContain("TabiLogo");
    expect(nav).not.toContain('tone="light"');
  });

  it("does not theme-variant the logo component", () => {
    const logo = readSource("features/brand/TabiLogo.tsx");
    expect(logo).not.toMatch(/theme|motif|Ocean|Sakura|Forest|Sunset/i);
  });

  it("preserves compact combobox/search surfaces without EmptyState-style logo blocks", () => {
    const placeSearch = readSource("features/places/PlaceSearchField.tsx");
    const destinationSearch = readSource("features/create-trip/DestinationSearchField.tsx");
    expect(placeSearch).not.toContain("TabiLogo");
    expect(destinationSearch).not.toContain("TabiLogo");
  });

  it("does not change PWA manifest icon paths", () => {
    const manifest = readSource("app/manifest.ts");
    expect(manifest).toContain("/icons/icon-192.png");
    expect(manifest).toContain("/icons/icon-maskable-512.png");
    expect(manifest).not.toContain("WhatsApp_Image");
  });

});
