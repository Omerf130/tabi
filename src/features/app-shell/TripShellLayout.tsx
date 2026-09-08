import type { ReactNode } from "react";
import { TripPrimaryNav } from "./TripPrimaryNav";
import styles from "./TripShellLayout.module.scss";
import type { TripShellContext } from "./types";

type TripShellLayoutProps = TripShellContext & {
  children: ReactNode;
};

export function TripShellLayout({
  tripId,
  children,
}: TripShellLayoutProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.railSlot}>
        <TripPrimaryNav tripId={tripId} variant="rail" />
      </aside>
      <div className={styles.mainColumn}>
        <div className={styles.contentArea}>{children}</div>
      </div>
      <div className={styles.bottomNavSlot}>
        <TripPrimaryNav tripId={tripId} variant="bottom" />
      </div>
    </div>
  );
}
