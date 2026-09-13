export type NavSection =
  | "home"
  | "itinerary"
  | "documents"
  | "settings"
  | "more";

export const NAV_LABELS: Record<NavSection, string> = {
  home: "בית",
  itinerary: "מסלול",
  documents: "מסמכים",
  settings: "הגדרות",
  more: "עוד",
};

export const NAV_SECTIONS: NavSection[] = [
  "home",
  "itinerary",
  "documents",
  "settings",
  "more",
];

export function buildTripNavHref(
  tripId: string,
  section: NavSection,
): string {
  const base = `/app/trips/${tripId}`;
  if (section === "home") {
    return base;
  }
  if (section === "settings") {
    return `${base}/manage`;
  }
  return `${base}/${section}`;
}

export function getActiveNavSection(
  pathname: string,
  tripId: string,
): NavSection | null {
  const base = `/app/trips/${tripId}`;

  if (pathname === base || pathname === `${base}/`) {
    return "home";
  }

  if (!pathname.startsWith(`${base}/`)) {
    return null;
  }

  const suffix = pathname.slice(base.length + 1);
  const segment = suffix.split("/")[0];

  if (segment === "itinerary") {
    return "itinerary";
  }
  if (segment === "documents") {
    return "documents";
  }
  if (segment === "manage" || segment === "members" || segment === "settings") {
    return "settings";
  }
  if (
    segment === "more" ||
    segment === "accommodations" ||
    segment === "lists" ||
    segment === "currency" ||
    segment === "weather" ||
    segment === "transport" ||
    segment === "language" ||
    segment === "emergency" ||
    segment === "finance"
  ) {
    return "more";
  }

  return null;
}

export function isSecondaryTripRoute(
  pathname: string,
  tripId: string,
): boolean {
  const base = `/app/trips/${tripId}`;
  return pathname.startsWith(`${base}/`) && pathname !== base;
}
