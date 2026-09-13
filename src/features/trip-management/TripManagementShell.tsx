import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { IconBack } from "@/components/ui/icons";
import { buildSettingsHubHref } from "@/features/settings/constants";
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
  const tSettings = await getTranslations("Settings");

  return (
    <AppPage width="wide">
      <div className={styles.shell}>
        <Link href={buildSettingsHubHref(tripId)} className={styles.backToSettings}>
          <IconBack className={styles.backToSettingsIcon} aria-hidden />
          <span>{tSettings("backToHub")}</span>
        </Link>
        <div className={styles.intro}>
          <h2 className={styles.introTitle}>{t("introTitle")}</h2>
          <p className={styles.introLead}>{t("introLead")}</p>
        </div>

        <div className={styles.body}>
          <TripManagementNavClient tripId={tripId} isOwner={isOwner} />
          <div className={styles.workspace}>{children}</div>
        </div>

      </div>
    </AppPage>
  );
}
