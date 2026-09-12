import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AUTH_BACKGROUND_SRC } from "./auth-visual";
import { deriveRegistrationNameFromEmail } from "./derive-registration-name";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("auth presentation contracts", () => {
  it("uses the supplied auth background asset", () => {
    expect(AUTH_BACKGROUND_SRC).toContain("/destination-visuals/auth/");
    expect(AUTH_BACKGROUND_SRC).toContain("WhatsApp Image 2026-09-11 at 17.28.18.jpeg");
  });

  it("keeps login and register on the shared full-bleed auth shell", () => {
    const shell = readSource("features/auth/AuthPageShell.tsx");
    const login = readSource("app/login/page.tsx");
    const register = readSource("app/register/page.tsx");

    expect(shell).toContain('dir="ltr"');
    expect(login).toContain("Welcome back");
    expect(register).toContain("Save your journey");
    expect(shell).not.toContain("formPanel");
    expect(shell).not.toContain("visualPanel");
  });

  it("preserves google oauth wiring and password visibility controls", () => {
    const google = readSource("features/auth/GoogleSignInButton.tsx");
    const field = readSource("features/auth/AuthField.tsx");

    expect(google).toContain("buildGoogleAuthHref");
    expect(google).toContain("Continue with Google");
    expect(field).toContain("Show password");
    expect(field).toContain("Hide password");
  });

  it("derives registration names without exposing a separate name field", () => {
    const registerForm = readSource("features/auth/RegisterForm.tsx");

    expect(registerForm).not.toContain('label="Name"');
    expect(registerForm).toContain("deriveRegistrationNameFromEmail");
    expect(deriveRegistrationNameFromEmail("alex@example.com")).toBe("alex");
  });
});
