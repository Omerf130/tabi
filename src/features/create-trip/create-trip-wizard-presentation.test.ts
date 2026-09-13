import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CREATE_TRIP_HERO_VISUAL } from "./create-trip-visual";
import { CREATE_TRIP_WIZARD_STEPS } from "./wizard-state";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("create trip wizard presentation contracts", () => {
  it("uses the approved hero asset", () => {
    expect(CREATE_TRIP_HERO_VISUAL).toContain(
      "/destination-visuals/auth/WhatsApp Image 2026-09-11 at 17.31.54.jpeg",
    );
  });

  it("shows exactly three visible steps with no Ready step", () => {
    expect(CREATE_TRIP_WIZARD_STEPS).toEqual(["destination", "dates", "details"]);
    const wizard = readSource("features/create-trip/CreateTripWizard.tsx");
    expect(wizard).not.toContain('"ready"');
    expect(wizard).not.toContain("You're ready");
  });

  it("preserves Google Places destination search and canonical quick selection", () => {
    const search = readSource("features/create-trip/DestinationSearchField.tsx");
    const wizard = readSource("features/create-trip/CreateTripWizard.tsx");

    expect(search).toContain("/app/api/places/destination/resolve");
    expect(search).toContain('useTranslations("CreateTrip.destination")');
    expect(wizard).toContain("resolveDestinationFromQuery");
    expect(wizard).toContain("PopularDestinationRows");
  });

  it("uses an inline calendar and compact trip summary on step 3", () => {
    const wizard = readSource("features/create-trip/CreateTripWizard.tsx");
    expect(wizard).toContain("TripDateRangeCalendar");
    expect(wizard).toContain('tDetails("create")');
    expect(wizard).toContain("tripSummary");
    expect(wizard).not.toContain('type="date"');
  });

  it("keeps final creation on the existing server action without draft writes", () => {
    const wizard = readSource("features/create-trip/CreateTripWizard.tsx");
    expect(wizard).toContain("createTripWizardAction");
    expect(wizard).not.toContain("Trip.create");
    expect(wizard).not.toContain("fetch(");
  });

  it("adds optional trip description support", () => {
    const wizard = readSource("features/create-trip/CreateTripWizard.tsx");
    const schema = readSource("features/trips/schemas.ts");
    const model = readSource("models/Trip.ts");

    expect(wizard).toContain("tripDescription");
    expect(schema).toContain("TRIP_DESCRIPTION_MAX_LENGTH");
    expect(model).toContain("description");
  });

  it("exposes stepper accessibility semantics", () => {
    const stepper = readSource("features/create-trip/WizardStepper.tsx");
    expect(stepper).toContain('aria-current={isCurrent ? "step" : undefined}');
    expect(stepper).toContain('useTranslations("CreateTrip.steps")');
  });

  it("does not add unknown-date support", () => {
    const wizard = readSource("features/create-trip/CreateTripWizard.tsx");
    expect(wizard).not.toContain("I don't know my dates yet");
  });
});
