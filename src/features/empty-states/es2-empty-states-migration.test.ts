import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MyTripsEmptyState } from "@/features/my-trips/MyTripsEmptyState";
import { CREATE_TRIP_PATH } from "@/features/my-trips/constants";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (name: string) => {
    if (namespace === "MyTrips.empty" && name === "showAllTrips") {
      return "Show all trips";
    }
    return `${namespace}.${name}`;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href }, children),
}));

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

describe("ES2 production empty state migration", () => {
  it("My Trips uses Full travel empty when the account has zero trips", () => {
    const html = renderToStaticMarkup(
      React.createElement(MyTripsEmptyState, {
        filter: "all",
        hasAnyTrips: false,
      }),
    );

    expect(html).toContain('data-variant="full"');
    expect(html).toContain('data-motif="travel"');
    expect(html).toContain(CREATE_TRIP_PATH);
    expect(html).not.toContain('data-variant="search"');
  });

  it("My Trips uses Search empty when filters miss but trips exist", () => {
    const html = renderToStaticMarkup(
      React.createElement(MyTripsEmptyState, {
        filter: "past",
        hasAnyTrips: true,
        onShowAllTrips: () => undefined,
      }),
    );

    expect(html).toContain('data-variant="search"');
    expect(html).toContain('data-motif="search"');
    expect(html).not.toContain(CREATE_TRIP_PATH);
    expect(html).toContain("Show all trips");
  });

  it("hides before-trip reminders section when there are none", () => {
    const journey = readSource("features/trip-home/BeforeTripJourney.tsx");
    const section = readSource("features/trip-home/BeforeTripRemindersSection.client.tsx");

    expect(journey).toContain("journey.upcomingReminders ?");
    expect(journey).not.toContain("upcomingReminders ?? []");
    expect(section).not.toContain("upcomingRemindersEmpty");
  });

  it("Today's Plan uses compact shared section empty state", () => {
    const plan = readSource("features/trip-home/TodaysPlanSection.tsx");
    const empty = readSource("features/trip-home/TodaysPlanEmpty.client.tsx");

    expect(plan).toContain("TodaysPlanEmpty");
    expect(empty).toContain('variant="section"');
    expect(empty).toContain('visualDensity="compact"');
  });

  it("Weather separates missing location from provider failure", () => {
    const weather = readSource("features/weather/WeatherPage.client.tsx");

    expect(weather).toContain("ConfigNotice");
    expect(weather).toContain('motif: "weather"');
    expect(weather).toContain("ProviderAlert");
    expect(weather).toContain("loadFailed && !snapshot");
  });

  it("Weather search separates zero results from provider failure", () => {
    const search = readSource("features/weather/WeatherLocationSearch.client.tsx");

    expect(search).toContain('variant="search"');
    expect(search).toContain("searchFailed");
    expect(search).toContain("ProviderAlert");
    expect(search).toContain("noResults");
  });

  it("Documents uses section vs search empty states with owner CTA gating", () => {
    const documents = readSource("features/documents/DocumentsPageContent.tsx");

    expect(documents).toContain('motif: "documents"');
    expect(documents).toContain('variant="search"');
    expect(documents).toContain("getTravelDocumentsSettingsHref");
    expect(documents).toContain("isOwner");
  });

  it("Accommodation and Transport use motif section and search filter empties", () => {
    const accommodation = readSource("features/accommodations/AccommodationListView.client.tsx");
    const transport = readSource("features/transport/TransportListView.client.tsx");

    expect(accommodation).toContain('motif: "travel"');
    expect(accommodation).toContain('variant="search"');
    expect(transport).toContain('motif: "transport"');
    expect(transport).toContain('variant="search"');
  });
});
