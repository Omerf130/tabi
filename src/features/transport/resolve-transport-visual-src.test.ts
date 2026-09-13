import { describe, expect, it } from "vitest";
import { TRANSPORT_TYPES } from "./transport-types";
import { resolveTransportVisualSrc } from "./resolve-transport-visual-src";

describe("resolveTransportVisualSrc", () => {
  it("maps every transport type to a local visual asset", () => {
    expect(resolveTransportVisualSrc("flight")).toBe("/transport-visuals/flight.png");
    expect(resolveTransportVisualSrc("train")).toBe("/transport-visuals/train.png");
    expect(resolveTransportVisualSrc("bus")).toBe("/transport-visuals/bus.png");
    expect(resolveTransportVisualSrc("car")).toBe("/transport-visuals/car.png");
    expect(resolveTransportVisualSrc("taxi")).toBe("/transport-visuals/car.png");
    expect(resolveTransportVisualSrc("ferry")).toBe("/transport-visuals/ship.png");
  });

  it("covers all transport types", () => {
    for (const type of TRANSPORT_TYPES) {
      expect(resolveTransportVisualSrc(type)).toMatch(/^\/transport-visuals\/.+\.png$/);
    }
  });
});
