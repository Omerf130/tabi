import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CREATE_TRIP_PROGRESS_ALL_ASSETS,
  CREATE_TRIP_PROGRESS_STEP_ASSETS,
  CREATE_TRIP_READY_ASSET,
} from "./create-trip-progress-assets";
import { resolveCreateTripReadyTripLabel } from "./create-trip-ready-label";
import {
  CREATE_TRIP_PROGRESS_STEP_ICONS,
  getCreateTripProgressStepIcon,
} from "./create-trip-progress-step-icons";
import {
  CREATE_TRIP_PROGRESS_MIN_TOTAL_MS,
  CREATE_TRIP_PROGRESS_STEP_COUNT,
  CREATE_TRIP_PROGRESS_STEP_INTERVAL_MS,
  canShowCreateTripReady,
  getCreateTripProgressStepIndex,
} from "./create-trip-progress-timing";

const projectRoot = process.cwd();

describe("create trip progress timing", () => {
  it("uses the approved step count and intervals", () => {
    expect(CREATE_TRIP_PROGRESS_STEP_COUNT).toBe(5);
    expect(CREATE_TRIP_PROGRESS_MIN_TOTAL_MS).toBe(6000);
    expect(CREATE_TRIP_PROGRESS_STEP_INTERVAL_MS).toBe(1200);
  });

  it("advances step index on schedule", () => {
    expect(getCreateTripProgressStepIndex(0)).toBe(0);
    expect(getCreateTripProgressStepIndex(1200)).toBe(1);
    expect(getCreateTripProgressStepIndex(4800)).toBe(4);
    expect(getCreateTripProgressStepIndex(99999)).toBe(4);
  });

  it("never shows Ready without tripId", () => {
    expect(canShowCreateTripReady({ elapsedMs: 5000, tripId: null })).toBe(false);
    expect(canShowCreateTripReady({ elapsedMs: 5000, tripId: "" })).toBe(false);
  });

  it("waits for minimum duration even when tripId exists", () => {
    expect(
      canShowCreateTripReady({ elapsedMs: 4000, tripId: "abc123" }),
    ).toBe(false);
    expect(
      canShowCreateTripReady({
        elapsedMs: CREATE_TRIP_PROGRESS_MIN_TOTAL_MS,
        tripId: "abc123",
      }),
    ).toBe(true);
  });

  it("allows Ready after slow server once duration and tripId are satisfied", () => {
    expect(
      canShowCreateTripReady({
        elapsedMs: CREATE_TRIP_PROGRESS_MIN_TOTAL_MS + 500,
        tripId: "507f1f77bcf86cd799439011",
      }),
    ).toBe(true);
  });
});

describe("create trip ready heading label", () => {
  it("uses the trip display name when available", () => {
    expect(
      resolveCreateTripReadyTripLabel({
        tripName: "Italy 2026",
        destinationDisplayName: "Italy",
      }),
    ).toBe("Italy 2026");
  });

  it("falls back to destination when trip name is empty", () => {
    expect(
      resolveCreateTripReadyTripLabel({
        tripName: "",
        destinationDisplayName: "Thailand",
      }),
    ).toBe("Thailand");
  });

  it("does not concatenate destination and trip name in messages", () => {
    const en = JSON.parse(
      readFileSync(join(projectRoot, "messages/en.json"), "utf8"),
    ) as { CreateTrip: { ready: Record<string, string> } };
    expect(en.CreateTrip.ready.heading).toContain("{tripLabel}");
    expect(en.CreateTrip.ready.headingWithDestination).toBeUndefined();
  });
});

describe("create trip progress step icons", () => {
  it("maps five step icons in order", () => {
    expect(CREATE_TRIP_PROGRESS_STEP_ICONS).toHaveLength(5);
    expect(getCreateTripProgressStepIcon(0)).toBe(CREATE_TRIP_PROGRESS_STEP_ICONS[0]);
    expect(getCreateTripProgressStepIcon(4)).toBe(CREATE_TRIP_PROGRESS_STEP_ICONS[4]);
    expect(getCreateTripProgressStepIcon(99)).toBe(CREATE_TRIP_PROGRESS_STEP_ICONS[4]);
  });
});

describe("create trip progress assets", () => {
  it("maps the six exact public theme paths", () => {
    expect([...CREATE_TRIP_PROGRESS_STEP_ASSETS]).toEqual([
      "/themes/ocean/top-wave.png",
      "/themes/forest/forest-top.png",
      "/themes/ocean/wave.png",
      "/themes/Sakura/sakura.png",
      "/themes/ocean/bottom-wave.png",
    ]);
    expect(CREATE_TRIP_READY_ASSET).toBe("/themes/Sakura/sakura-bottom.png");
    expect(CREATE_TRIP_PROGRESS_ALL_ASSETS).toHaveLength(6);
  });

  it("assets exist on disk", () => {
    for (const src of CREATE_TRIP_PROGRESS_ALL_ASSETS) {
      const relative = `public${src}`;
      expect(existsSync(join(projectRoot, relative))).toBe(true);
    }
  });
});

describe("create trip progress UI contracts", () => {
  it("wires wizard phases and single-start guard", () => {
    const wizard = readFileSync(
      join(projectRoot, "src/features/create-trip/CreateTripWizard.tsx"),
      "utf8",
    );
    expect(wizard).toContain('useState<CreateTripUiPhase>("wizard")');
    expect(wizard).toContain("creationStartedRef");
    expect(wizard).toContain("CreateTripProgressExperience");
    expect(wizard).toContain("router.push(`/app/trips/${createdTripId}`)");
    expect(wizard).not.toContain("sessionStorage");
    expect(wizard).not.toContain("pushState");
    expect(wizard).toContain('setUiPhase("failed")');
    expect(wizard).toContain("creationStartedRef.current = false");
    expect(wizard).toMatch(/createTripWizardAction\(/);
    expect(wizard.match(/createTripWizardAction\(/g)?.length).toBe(1);
  });

  it("includes Hebrew and English progress copy", () => {
    const en = JSON.parse(
      readFileSync(join(projectRoot, "messages/en.json"), "utf8"),
    ) as { CreateTrip: { progress: { steps: Record<string, unknown> }; ready: { cta: string } } };
    const he = JSON.parse(
      readFileSync(join(projectRoot, "messages/he.json"), "utf8"),
    ) as {
      CreateTrip: {
        progress: { steps: Record<string, { label: string }> };
        ready: { cta: string };
      };
    };

    expect(en.CreateTrip.progress.steps["1"]).toBeTruthy();
    expect(en.CreateTrip.progress.steps["5"]).toBeTruthy();
    expect(en.CreateTrip.ready.cta).toBe("Go to My Trip");
    expect(he.CreateTrip.ready.cta).toBe("כניסה לטיול");
    expect(he.CreateTrip.progress.steps["1"]?.label).toBeTruthy();
    expect(he.CreateTrip.progress.steps["5"]?.label).toBeTruthy();
  });

  it("respects reduced motion in progress styles", () => {
    const scss = readFileSync(
      join(projectRoot, "src/features/create-trip/CreateTripProgressExperience.module.scss"),
      "utf8",
    );
    expect(scss).toContain("prefers-reduced-motion: reduce");
    expect(scss).toContain("animation: none");

    const atmosphere = readFileSync(
      join(projectRoot, "src/features/create-trip/create-trip-atmosphere.scss"),
      "utf8",
    );
    expect(atmosphere).toContain("--ct-accent");
    expect(scss).toContain("data-visual-step");
  });

  it("uses visual stage with atmosphere img and shared icons", () => {
    const experience = readFileSync(
      join(projectRoot, "src/features/create-trip/CreateTripProgressExperience.tsx"),
      "utf8",
    );
    const visualStage = readFileSync(
      join(projectRoot, "src/features/create-trip/CreateTripVisualStage.tsx"),
      "utf8",
    );
    expect(experience).toContain("CreateTripVisualStage");
    expect(experience).toContain("data-visual-step");
    expect(experience).not.toContain("comfortNote");
    expect(experience).not.toContain("TripThemeAtmosphere");
    expect(experience).toContain("resolveCreateTripReadyTripLabel");
    expect(experience).toContain("successBadge");
    expect(experience).toContain("readyBenefits");
    expect(visualStage).toContain("<img");
    expect(visualStage).toContain('alt=""');
    expect(visualStage).toContain("@/components/ui/icons");
  });

  it("includes ready badge and benefits copy in Hebrew and English", () => {
    const en = JSON.parse(
      readFileSync(join(projectRoot, "messages/en.json"), "utf8"),
    ) as { CreateTrip: { ready: { badge: string; benefits: Record<string, string> } } };
    const he = JSON.parse(
      readFileSync(join(projectRoot, "messages/he.json"), "utf8"),
    ) as { CreateTrip: { ready: { badge: string; benefits: Record<string, string> } } };

    expect(en.CreateTrip.ready.badge).toBeTruthy();
    expect(he.CreateTrip.ready.badge).toBeTruthy();
    expect(en.CreateTrip.ready.benefits.planDays).toBeTruthy();
    expect(he.CreateTrip.ready.benefits.share).toBeTruthy();
  });
});
