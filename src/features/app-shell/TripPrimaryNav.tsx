"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav/BottomNav";
import {
  IconDocuments,
  IconGear,
  IconHome,
  IconItinerary,
  IconMore,
} from "@/components/ui/icons";
import {
  buildTripNavHref,
  getActiveNavSection,
  NAV_LABELS,
  NAV_SECTIONS,
} from "./navigation";
import styles from "./TripPrimaryNav.module.scss";

const NAV_ICONS = {
  home: IconHome,
  itinerary: IconItinerary,
  documents: IconDocuments,
  settings: IconGear,
  more: IconMore,
} as const;

type TripPrimaryNavProps = {
  tripId: string;
  variant: "bottom" | "rail";
};

export function TripPrimaryNav({ tripId, variant }: TripPrimaryNavProps) {
  const pathname = usePathname();
  const activeSection = getActiveNavSection(pathname, tripId);

  const items = NAV_SECTIONS.map((section) => {
    const Icon = NAV_ICONS[section];
    return {
      id: section,
      label: NAV_LABELS[section],
      href: buildTripNavHref(tripId, section),
      icon: <Icon />,
      active: activeSection === section,
    };
  });

  if (variant === "rail") {
    return (
      <div className={styles.rail}>
        <div className={styles.brand} aria-hidden>
          Tabi
        </div>
        <div className={styles.navWrap}>
          <BottomNav items={items} variant="rail" />
        </div>
      </div>
    );
  }

  return <BottomNav items={items} variant={variant} />;
}
