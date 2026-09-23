import { readFileSync } from "node:fs";

import { join } from "node:path";

import { describe, expect, it } from "vitest";



describe("during trip home visual layering", () => {

  const scss = readFileSync(

    join(process.cwd(), "src/features/trip-home/TripHomeContent.module.scss"),

    "utf8",

  );

  const appPage = readFileSync(

    join(process.cwd(), "src/features/app-shell/AppPage.module.scss"),

    "utf8",

  );

  const shell = readFileSync(

    join(process.cwd(), "src/features/app-shell/TripShellLayout.module.scss"),

    "utf8",

  );

  const journey = readFileSync(

    join(process.cwd(), "src/features/trip-home/DuringTripJourney.tsx"),

    "utf8",

  );



  it("keeps themeScope as atmospheric background owner", () => {

    expect(shell).toContain(".themeScope");

    expect(shell).toMatch(/\.themeScope[\s\S]{0,120}background-color:\s*var\(--color-background\)/);

    expect(shell).toMatch(/\.shell[\s\S]{0,220}background-color:\s*transparent/);

  });



  it("does not force a full-viewport opaque fill on outer Home wrappers", () => {

    expect(scss).toMatch(

      /\.home\[data-phase="active"\][\s\S]*?background:\s*transparent[\s\S]*?margin-inline:\s*0/,

    );

    expect(scss).not.toMatch(/\.home\[data-phase="active"\][\s\S]{0,200}flex:\s*1/);

    expect(scss).toMatch(/\.duringJourney[\s\S]{0,200}background:\s*transparent/);

    expect(scss).not.toMatch(/\.duringJourney[\s\S]{0,200}flex:\s*1/);

    expect(scss).not.toMatch(/\.duringTodaySurface[\s\S]{0,200}flex:\s*1/);

    expect(appPage).not.toMatch(/\[data-flush-top="true"\][\s\S]{0,200}min-height:\s*calc/);

    expect(shell).not.toMatch(/\.contentArea[\s\S]{0,200}min-height:\s*calc/);

  });



  it("does not paint a large Today parent card around all sections", () => {

    expect(journey).toContain("duringTodaySurface");

    expect(journey.match(/duringTodaySurface/g)?.length).toBe(1);

    expect(scss).toMatch(/\.duringTodaySurface[\s\S]*?background:\s*transparent/);

    expect(scss).not.toMatch(

      /\.duringTodaySurface[\s\S]{0,400}background:\s*var\(--color-surface-home-page\)/,

    );

    expect(scss).not.toMatch(/\.duringTodaySurface[\s\S]{0,200}border-radius:\s*1rem/);

  });



  it("uses page gutters without stacking extra wrapper margins", () => {

    expect(appPage).toMatch(/\[data-flush-top="true"\][\s\S]*padding-inline:\s*var\(--space-2\)/);

    expect(scss).not.toMatch(/\.duringTodaySurface[\s\S]{0,200}margin-inline:\s*var\(--space-2\)/);

  });



  it("keeps local activity cards and Later Today panel surfaces", () => {

    expect(scss).toContain(".activityCompactCard");

    expect(scss).toContain(".laterTodayPanel");

    expect(scss).toContain("--during-local-surface: var(--color-surface-card)");

  });

});


