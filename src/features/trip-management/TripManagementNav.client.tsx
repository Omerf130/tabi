"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  buildTripManagementHref,
  getVisibleManagementSections,
  parseTripManagementSection,
  type TripManagementSection,
} from "./constants";
import styles from "./TripManagementShell.module.scss";

type TripManagementNavClientProps = {
  tripId: string;
  isOwner: boolean;
};

function getActiveSection(pathname: string, tripId: string): TripManagementSection | null {
  const prefix = `/app/trips/${tripId}/manage/`;
  if (!pathname.startsWith(prefix)) {
    return null;
  }
  const section = pathname.slice(prefix.length).split("/")[0];
  return parseTripManagementSection(section);
}

export function TripManagementNavClient({
  tripId,
  isOwner,
}: TripManagementNavClientProps) {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname, tripId);
  const sections = getVisibleManagementSections(isOwner);

  return (
    <>
      <nav className={styles.mobileNav} aria-label="ניהול הטיול">
        <div className={styles.mobileGrid}>
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <Link
                key={section.id}
                href={buildTripManagementHref(tripId, section.id)}
                className={styles.chip}
                data-active={isActive ? "true" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {section.shortLabel}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className={styles.desktopNav} aria-label="ניהול הטיול">
        <ul className={styles.sidebarList}>
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <li key={section.id}>
                <Link
                  href={buildTripManagementHref(tripId, section.id)}
                  className={styles.sidebarLink}
                  data-active={isActive ? "true" : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
