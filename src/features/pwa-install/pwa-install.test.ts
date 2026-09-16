import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("PwaInstall localization", () => {
  it("defines Hebrew and English install strings", () => {
    for (const locale of ["en", "he"] as const) {
      const messages = JSON.parse(
        readFileSync(join(root, `messages/${locale}.json`), "utf8"),
      ) as { PwaInstall: Record<string, string> };

      expect(messages.PwaInstall.cta).toBeTruthy();
      expect(messages.PwaInstall.iosTitle).toBeTruthy();
      expect(messages.PwaInstall.iosStep1).toBeTruthy();
      expect(messages.PwaInstall.iosStep2).toBeTruthy();
      expect(messages.PwaInstall.iosStep3).toBeTruthy();
    }
  });

  it("uses the approved CTA labels", () => {
    const en = JSON.parse(
      readFileSync(join(root, "messages/en.json"), "utf8"),
    ) as { PwaInstall: { cta: string } };
    const he = JSON.parse(
      readFileSync(join(root, "messages/he.json"), "utf8"),
    ) as { PwaInstall: { cta: string } };

    expect(en.PwaInstall.cta).toBe("Install Tabi");
    expect(he.PwaInstall.cta).toBe("התקנת Tabi");
  });
});

describe("PwaInstall welcome integration", () => {
  it("mounts the reusable install action on the public homepage", () => {
    const welcomeSource = readFileSync(
      join(root, "src/features/welcome/WelcomeScreen.tsx"),
      "utf8",
    );

    expect(welcomeSource).toContain("PwaInstallAction");
    expect(welcomeSource).toContain('appearance="welcome"');
  });

  it("keeps install logic out of the welcome page", () => {
    const welcomeSource = readFileSync(
      join(root, "src/features/welcome/WelcomeScreen.tsx"),
      "utf8",
    );

    expect(welcomeSource).not.toContain("beforeinstallprompt");
  });
});

describe("PwaInstall architecture", () => {
  it("centralizes environment detection in helpers", () => {
    const hookSource = readFileSync(
      join(root, "src/features/pwa-install/use-pwa-install.client.ts"),
      "utf8",
    );

    expect(hookSource).toContain("beforeinstallprompt");
    expect(hookSource).toContain("preventDefault");
    expect(hookSource).toContain("runDeferredInstallPrompt");
  });

  it("does not add service worker dependencies", () => {
    const pkg = readFileSync(join(root, "package.json"), "utf8");
    expect(pkg).not.toMatch(/serwist|@serwist\/next|next-pwa|workbox/i);
  });
});
