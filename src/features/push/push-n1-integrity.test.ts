import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { classifyPwaRequest, PwaCachePolicy } from "@/features/pwa/pwa-request-policy";

const root = process.cwd();

describe("Push N1 integrity", () => {
  it("keeps account notification routes on private network-only paths", () => {
    expect(
      classifyPwaRequest({
        url: "https://tabi.example/app/account/notifications",
        method: "GET",
        headers: {},
        destination: "document",
        mode: "navigate",
      }),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

});
