import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("TripHeader RTL chevrons", () => {
  it("flips back and switch glyphs for rtl with ltr override", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/app-shell/TripHeader.module.scss"),
      "utf8",
    );

    expect(source).toContain(".backGlyph");
    expect(source).toContain(".switchGlyph");
    expect(source).toContain(':global(html[dir="ltr"]) .backGlyph');
    expect(source).toContain(':global(html[dir="ltr"]) .switchGlyph');
  });
});
