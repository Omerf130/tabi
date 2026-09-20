import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProviderAlert } from "@/components/ui/ProviderAlert";
import { IconGrid, IconPlane } from "@/components/ui/icons";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => React.createElement("a", { href, className }, children),
}));

const foundationSources = [
  "components/ui/EmptyState/EmptyState.tsx",
  "components/ui/EmptyState/EmptyStateActions.tsx",
  "components/ui/EmptyState/EmptyStateIcon.tsx",
  "components/ui/EmptyState/EmptyStateVisual.tsx",
  "components/ui/EmptyState/EmptyStateVisual.module.scss",
  "components/ui/EmptyState/EmptyStateMotifScenery.tsx",
  "components/ui/EmptyState/empty-state-visual.types.ts",
  "components/ui/ProviderAlert/ProviderAlertVisual.tsx",
  "components/ui/EmptyState/EmptyState.module.scss",
  "components/ui/ConfigNotice/ConfigNotice.tsx",
  "components/ui/ConfigNotice/ConfigNotice.module.scss",
  "components/ui/ProviderAlert/ProviderAlert.tsx",
  "components/ui/ProviderAlert/ProviderAlert.module.scss",
];

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

describe("Empty State foundation", () => {
  it("renders Full with title, description, and actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "full",
        icon: React.createElement(IconGrid),
        title: "No trips yet",
        description: "Start planning your next adventure.",
        primaryAction: { label: "Plan a trip", href: "/app/trips/new" },
        secondaryAction: { label: "Learn more", href: "/help", variant: "secondary" },
      }),
    );

    expect(html).toContain("<h2");
    expect(html).toContain("No trips yet");
    expect(html).toContain("Start planning");
    expect(html).toContain('href="/app/trips/new"');
    expect(html).toContain("Plan a trip");
    expect(html).toContain("Learn more");
  });

  it("renders Section with subtle-bordered surface treatment", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "section",
        surface: "subtle-bordered",
        title: "No documents",
        description: "Add tickets and bookings for the trip.",
        primaryAction: { label: "Add document", href: "/manage" },
      }),
    );

    expect(html).toContain('data-surface="subtle-bordered"');
    expect(html).toContain("No documents");
  });

  it("renders Inline with description only and optional text link", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "inline",
        description: "No expenses recorded yet.",
        primaryAction: { label: "Open finance", href: "/finance" },
      }),
    );

    expect(html).not.toContain("<h2");
    expect(html).toContain("No expenses recorded yet.");
    expect(html).toContain('href="/finance"');
  });

  it("renders Search with clear action", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "search",
        icon: React.createElement(IconGrid),
        title: "No matches",
        description: "Try another keyword.",
        primaryAction: { label: "Clear search", onClick: () => undefined },
      }),
    );

    expect(html).toContain("<h3");
    expect(html).toContain("No matches");
    expect(html).toContain("Clear search");
    expect(html).toContain("<button");
  });

  it("omits action controls when actions are not provided", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "section",
        title: "Nothing here",
      }),
    );

    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");
  });

  it("wraps decorative icons with aria-hidden", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "full",
        icon: React.createElement(IconGrid),
        title: "Title",
      }),
    );

    expect(html).toContain('aria-hidden="true"');
  });

  it("renders motif composition with optional accent", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "full",
        visual: {
          motif: "travel",
          icon: React.createElement(IconGrid),
          accentIcon: React.createElement(IconPlane),
        },
        title: "Title",
      }),
    );

    expect(html).toContain('data-scale="full"');
    expect(html).toContain('data-motif="travel"');
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(1);
  });

  it("renders distinct motifs for section previews", () => {
    const documents = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "section",
        visual: { motif: "documents", icon: React.createElement(IconGrid) },
        title: "No documents",
      }),
    );
    const transport = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "section",
        visual: { motif: "transport", icon: React.createElement(IconGrid) },
        title: "No transport",
      }),
    );

    expect(documents).toContain('data-motif="documents"');
    expect(transport).toContain('data-motif="transport"');
    expect(documents).not.toEqual(transport);
  });

  it("uses secondary-style primary action for search variant", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        variant: "search",
        title: "No matches",
        primaryAction: { label: "Clear", href: "#" },
      }),
    );

    expect(html).toContain('data-tone="subtle"');
  });

  it("ConfigNotice uses status semantics, not alert", () => {
    const html = renderToStaticMarkup(
      React.createElement(ConfigNotice, {
        icon: React.createElement(IconGrid),
        title: "Choose a location",
        description: "Weather needs a place to show forecasts.",
        primaryAction: { label: "Search location", onClick: () => undefined },
      }),
    );

    expect(html).toContain('role="status"');
    expect(html).not.toContain('role="alert"');
  });

  it("ProviderAlert exposes alert semantics", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProviderAlert, {
        message: "Could not load weather.",
        retryAction: { label: "Retry", onClick: () => undefined },
      }),
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Could not load weather.");
    expect(html).toContain("Retry");
  });

  it("contains no destination-specific or feature-scoped palette tokens in shared styles", () => {
    for (const relativePath of foundationSources) {
      const source = readSource(relativePath);
      expect(source).not.toMatch(/--wallet-/);
      expect(source).not.toMatch(/--transport-/);
      expect(source).not.toMatch(/--my-trips-/);
      expect(source).not.toMatch(/countryCode|tripPhase|isDocuments|isFinance/);
    }
  });

  it("contains no hardcoded Hebrew or English product copy in shared components", () => {
    const tsxSources = foundationSources.filter((path) => path.endsWith(".tsx"));
    for (const relativePath of tsxSources) {
      const source = readSource(relativePath);
      expect(source).not.toMatch(/[\u0590-\u05FF]/);
      expect(source).not.toMatch(
        /No (trips|documents|expenses|results)|Plan a trip|Choose a location/,
      );
    }
  });

  it("exports foundation modules from ui folders", () => {
    const emptyStateDir = join(process.cwd(), "src/components/ui/EmptyState");
    const files = readdirSync(emptyStateDir);
    expect(files).toContain("EmptyState.tsx");
    expect(files).toContain("index.ts");
    expect(readSource("components/ui/EmptyState/index.ts")).toContain("EmptyState");
    expect(readSource("components/ui/ConfigNotice/index.ts")).toContain("ConfigNotice");
    expect(readSource("components/ui/ProviderAlert/index.ts")).toContain("ProviderAlert");
  });
});
