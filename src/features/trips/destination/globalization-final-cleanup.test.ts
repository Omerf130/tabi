import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MY_TRIPS_HERO_VISUAL } from "@/features/my-trips/constants";

const root = process.cwd();

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(read(relativePath)) as Record<string, unknown>;
}

describe("Globalization final cleanup guardrails", () => {
  it("My Trips hero does not use Japan-specific artwork", () => {
    expect(MY_TRIPS_HERO_VISUAL).not.toContain("japan.png");
  });

  it("Create Trip description placeholder is destination-neutral", () => {
    const en = readJson("messages/en.json") as {
      CreateTrip: { details: { descriptionPlaceholder: string } };
    };
    const he = readJson("messages/he.json") as {
      CreateTrip: { details: { descriptionPlaceholder: string } };
    };
    expect(en.CreateTrip.details.descriptionPlaceholder).not.toMatch(/Japan/i);
    expect(he.CreateTrip.details.descriptionPlaceholder).not.toMatch(/יפן/);
  });

  it("Transport form has no Tokyo/Kyoto literal placeholders", () => {
    const source = read("src/features/transport/TransportForm.client.tsx");
    expect(source).not.toContain('placeholder="Tokyo"');
    expect(source).not.toContain('placeholder="Kyoto"');
    expect(source).toContain("departureLocationPlaceholder");
  });

  it("Documents page does not import Japan wallet artwork", () => {
    const source = read("src/features/documents/DocumentsPageContent.tsx");
    expect(source).not.toContain("@/assets/pics/");
    expect(source).not.toContain("japanWalletHero");
  });

  it("dead Japan transport timezone helper is removed", () => {
    const timezoneOptions = read("src/features/transport/timezone-options.ts");
    expect(timezoneOptions).not.toContain("getDefaultJapanTransportTimezone");
    const constants = read("src/features/transport/constants.ts");
    expect(constants).not.toContain("DEFAULT_JAPAN_TRANSPORT_TIMEZONE");
  });

  it("current architecture doc does not describe Japan-only product", () => {
    const architecture = read("docs/architecture.md");
    expect(architecture).not.toMatch(/companion for Japan/i);
    expect(architecture).not.toMatch(/assume Japan as the destination/i);
  });
});
