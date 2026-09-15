"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppHeader } from "@/components/ui/AppHeader/AppHeader";
import { IconBack, IconChevron } from "@/components/ui/icons";
import { buildSettingsHubHref } from "@/features/settings/constants";
import styles from "./TripHeader.module.scss";

type TripManageHeaderProps = {
  tripId: string;
  title: string;
  tripName: string;
};

export function resolveManageBackHref(pathname: string, tripId: string): string {
  const detailsPath = `/app/trips/${tripId}/manage/details`;
  const travelersPath = `/app/trips/${tripId}/manage/members`;
  if (pathname === detailsPath || pathname.startsWith(`${detailsPath}/`)) {
    return buildSettingsHubHref(tripId);
  }
  if (pathname === travelersPath || pathname.startsWith(`${travelersPath}/`)) {
    return buildSettingsHubHref(tripId);
  }
  return `/app/trips/${tripId}/more`;
}

export function TripManageHeader({
  tripId,
  title,
  tripName,
}: TripManageHeaderProps) {
  const t = useTranslations("TripHeader");
  const pathname = usePathname();
  const backHref = resolveManageBackHref(pathname, tripId);

  return (
    <div className={styles.wrapper} data-mode="section">
      <AppHeader
        title={title}
        align="start"
        borderless
        className={styles.headerBar}
        titleClassName={styles.titleSection}
        leading={
          <Link href={backHref} className={styles.backLink} aria-label={t("back")}>
            <IconBack className={styles.backGlyph} />
          </Link>
        }
      />
      <div className={styles.contextRow}>
        <span className={styles.tripName}>{tripName}</span>
        <Link href="/app" className={styles.switchLink}>
          <span className={styles.switchLabel}>{t("myTrips")}</span>
          <IconChevron className={styles.switchGlyph} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
