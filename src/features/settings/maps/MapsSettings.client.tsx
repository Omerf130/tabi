"use client";

import Link from "next/link";
import { IconBack } from "@/components/ui/icons";
import { PreferredMapsAppPreference } from "@/features/maps/components/PreferredMapsAppPreference";
import type { MapsApp } from "@/lib/maps/maps-app";
import { buildSettingsHubHref } from "@/features/settings/constants";
import { useTranslations } from "next-intl";
import styles from "./MapsSettings.module.scss";

type MapsSettingsClientProps = {
  tripId: string;
  storedPreferredMapsApp: MapsApp | null;
};

export function MapsSettingsClient({
  tripId,
  storedPreferredMapsApp,
}: MapsSettingsClientProps) {
  const t = useTranslations("Settings");

  return (
    <div className={styles.page}>
      <Link href={buildSettingsHubHref(tripId)} className={styles.back}>
        <IconBack className={styles.backIcon} aria-hidden />
        <span>{t("mapsPage.back")}</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{t("rows.maps.title")}</h1>
        <p className={styles.lead}>{t("mapsPage.lead")}</p>
      </header>

      <section aria-labelledby="preferred-maps-app-label">
        <h2 id="preferred-maps-app-label" className={styles.sectionLabel}>
          {t("mapsPage.sectionTitle")}
        </h2>
        <p className={styles.sectionHint}>{t("mapsPage.sectionHint")}</p>
        <div className={styles.group}>
          <PreferredMapsAppPreference
            storedPreferredMapsApp={storedPreferredMapsApp}
            variant="settingsList"
          />
        </div>
      </section>
    </div>
  );
}
