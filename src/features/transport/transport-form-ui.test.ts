import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("transport form compact UI", () => {
  const formSource = readFileSync(
    join(process.cwd(), "src/features/transport/TransportForm.client.tsx"),
    "utf8",
  );
  const scss = readFileSync(
    join(process.cwd(), "src/features/transport/TransportForm.module.scss"),
    "utf8",
  );

  it("hides timezone selectors while submitting timezone values", () => {
    expect(formSource).toContain("HiddenTimezoneFields");
    expect(formSource).toContain('name="departureTimezone"');
    expect(formSource).toContain('name="arrivalTimezone"');
    expect(formSource).not.toContain("TimezoneSelect");
    expect(formSource).not.toMatch(/label=\{t\("timezone"\)\}/);
  });

  it("places from and to on one row with a route indicator", () => {
    expect(scss).toContain(".routeRow");
    expect(scss).toContain(".routeIndicator");
    expect(formSource).toMatch(/className=\{styles\.routeRow\}/);
  });

  it("keeps departure and arrival date/time on paired rows", () => {
    expect(formSource).toContain('{t("departure")}');
    expect(formSource).toContain('{t("arrival")}');
    expect(formSource).toMatch(/departureDate[\s\S]{0,400}departureTime/);
    expect(formSource).toMatch(/arrivalDate[\s\S]{0,400}arrivalTime/);
  });
});
