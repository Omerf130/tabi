import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("memories legacy redirect", () => {
  it("redirects old memories URLs to Travel Hub", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "src/app/app/trips/[tripId]/memories/page.tsx",
      ),
      "utf8",
    );

    expect(source).toContain('redirect(`/app/trips/${tripId}/more`)');
    expect(source).not.toContain("PlaceholderPage");
  });
});
