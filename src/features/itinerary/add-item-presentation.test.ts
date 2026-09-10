import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TRANSPORT_TYPES } from "@/features/transport/transport-types";
import {
  getTransportTypeIconNames,
  TRANSPORT_TYPE_ICON_NAMES,
} from "./transport-type-icons";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("add item mobile presentation contracts", () => {
  it("uses a full-width 3-column transport tile grid at mobile width", () => {
    const scss = readSource("features/itinerary/AddItemFlow.module.scss");
    expect(scss).toMatch(/\.transportTileGrid[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    expect(scss).not.toMatch(/\.transportTypeGrid/);
  });

  it("renders six transport types as direct grid tile buttons", () => {
    const source = readSource("features/itinerary/TransportTypeChooser.client.tsx");
    expect(source).toContain('className={styles.transportTileGrid}');
    expect(source).toContain('className={styles.transportTile}');
    expect(source).not.toContain("<ul");
    expect(TRANSPORT_TYPES).toHaveLength(6);
  });

  it("maps each transport type to a distinct semantic icon", () => {
    const iconNames = getTransportTypeIconNames();
    expect(iconNames).toHaveLength(6);
    expect(new Set(iconNames).size).toBe(6);
    expect(TRANSPORT_TYPE_ICON_NAMES.train).toBe("IconTrain");
    expect(TRANSPORT_TYPE_ICON_NAMES.flight).toBe("IconPlane");
    expect(TRANSPORT_TYPE_ICON_NAMES.bus).toBe("IconBus");
    expect(TRANSPORT_TYPE_ICON_NAMES.car).toBe("IconCar");
    expect(TRANSPORT_TYPE_ICON_NAMES.taxi).toBe("IconTaxi");
    expect(TRANSPORT_TYPE_ICON_NAMES.ferry).toBe("IconFerry");
  });

  it("uses a dedicated activity overlay with full-width segmented control and search", () => {
    const overlay = readSource("features/itinerary/ActivityAddOverlay.client.tsx");
    const flowScss = readSource("features/itinerary/AddItemFlow.module.scss");
    const placeScss = readSource("features/places/placeSearch.module.scss");

    expect(overlay).toContain("PlaceModeSegment");
    expect(overlay).toContain("plannerPresentation");
    expect(overlay).toContain('className={styles.activityOverlayForm}');
    expect(flowScss).toMatch(/\.segmentedControl[\s\S]*grid-template-columns:\s*1fr 1fr/);
    expect(placeScss).toContain(".plannerSearchInput");
    expect(placeScss).toMatch(/\.plannerSearchInput[\s\S]*width:\s*100%/);
  });

  it("sizes the sheet to content instead of forcing flex growth", () => {
    const sheetScss = readSource("features/itinerary/DayPage.module.scss");
    const surface = readSource("features/itinerary/DayActionSurface.client.tsx");

    expect(sheetScss).toContain("height: fit-content");
    expect(sheetScss).toMatch(/\.sheetBody[\s\S]*flex:\s*0 0 auto/);
    expect(sheetScss).not.toContain("sheetBodyScrollable");
    expect(surface).not.toContain("sheetBodyScrollable");
    expect(surface).not.toContain("flex: 1");
  });

  it("does not introduce map UI in add item flows", () => {
    const transportForm = readSource("features/transport/TransportForm.client.tsx");
    const activityOverlay = readSource("features/itinerary/ActivityAddOverlay.client.tsx");

    expect(transportForm).not.toMatch(/google.*maps|MapEmbed|mapbox|leaflet/i);
    expect(activityOverlay).not.toMatch(/google.*maps|MapEmbed|mapbox|leaflet/i);
  });
});
