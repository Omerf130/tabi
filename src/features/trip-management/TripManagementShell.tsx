import type { ReactNode } from "react";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripManagementAccountFooter } from "./TripManagementAccountFooter";
import { TripManagementNavClient } from "./TripManagementNav.client";
import styles from "./TripManagementShell.module.scss";

type TripManagementShellProps = {
  tripId: string;
  isOwner: boolean;
  children: ReactNode;
};

export function TripManagementShell({
  tripId,
  isOwner,
  children,
}: TripManagementShellProps) {
  return (
    <AppPage width="wide">
      <div className={styles.shell}>
        <div className={styles.intro}>
          <h2 className={styles.introTitle}>ניהול הטיול</h2>
          <p className={styles.introLead}>
            כל מה שצריך כדי לעדכן ולנהל את הטיול שלכם במקום אחד.
          </p>
        </div>

        <div className={styles.body}>
          <TripManagementNavClient tripId={tripId} isOwner={isOwner} />
          <div className={styles.workspace}>{children}</div>
        </div>

        <TripManagementAccountFooter />
      </div>
    </AppPage>
  );
}
