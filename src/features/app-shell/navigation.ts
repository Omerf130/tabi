export type NavSection =
  | "home"
  | "itinerary"
  | "documents"
  | "memories"
  | "more";

export const NAV_LABELS: Record<NavSection, string> = {
  home: "בית",
  itinerary: "מסלול",
  documents: "מסמכים",
  memories: "זיכרונות",
  more: "עוד",
};

export function buildTripNavHref(
  tripId: string,
  section: NavSection,
): string {
  const base = `/app/trips/${tripId}`;
  if (section === "home") {
    return base;
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
  if (segment === "memories") {
    return "memories";
  }
  if (
    segment === "more" ||
    segment === "members" ||
    segment === "accommodations" ||
    segment === "lists"
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
