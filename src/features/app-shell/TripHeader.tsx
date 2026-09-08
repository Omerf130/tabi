import type { ReactNode } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader/AppHeader";
import { IconBack, IconChevron } from "@/components/ui/icons";
import styles from "./TripHeader.module.scss";

type TripHeaderProps = {
  title: string;
  tripName?: string;
  showTripSwitch?: boolean;
  backHref?: string;
};

export function TripHeader({
  title,
  tripName,
  showTripSwitch = false,
  backHref,
}: TripHeaderProps) {
  const mode = showTripSwitch ? "section" : "trip";

  return (
    <div className={styles.wrapper} data-mode={mode}>
      <AppHeader
        title={title}
        align="start"
        borderless
        className={styles.headerBar}
        titleClassName={
          mode === "trip" ? styles.titleTrip : styles.titleSection
        }
        leading={
          backHref ? (
            <Link href={backHref} className={styles.backLink} aria-label="חזרה">
              <IconBack className={styles.backGlyph} />
            </Link>
          ) : undefined
        }
      />
      {showTripSwitch && tripName ? (
        <div className={styles.contextRow}>
          <span className={styles.tripName}>{tripName}</span>
          <Link href="/app/trips" className={styles.switchLink}>
            <span className={styles.switchLabel}>הטיולים שלי</span>
            <IconChevron className={styles.switchGlyph} aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function GlobalAppHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <AppHeader
      title={title}
      trailing={trailing}
      align="start"
      className={styles.globalHeader}
      titleClassName={styles.globalTitle}
    />
  );
}
