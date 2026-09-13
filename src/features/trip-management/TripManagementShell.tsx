import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripManagementAccountFooter } from "./TripManagementAccountFooter";
import { TripManagementNavClient } from "./TripManagementNav.client";
import styles from "./TripManagementShell.module.scss";

type TripManagementShellProps = {
  tripId: string;
  isOwner: boolean;
  children: ReactNode;
};

export async function TripManagementShell({
  tripId,
  isOwner,
  children,
}: TripManagementShellProps) {
  const t = await getTranslations("TripManagement");

  return (
    <AppPage width="wide">
      <div className={styles.shell}>
        <div className={styles.intro}>
          <h2 className={styles.introTitle}>{t("introTitle")}</h2>
          <p className={styles.introLead}>{t("introLead")}</p>
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
