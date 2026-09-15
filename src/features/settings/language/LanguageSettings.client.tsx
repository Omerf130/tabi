"use client";

import Link from "next/link";
import { IconBack } from "@/components/ui/icons";
import { InterfaceLanguagePreference } from "@/features/i18n/components/InterfaceLanguagePreference";
import type { AppLocale } from "@/features/i18n/locale";
import { buildSettingsHubHref } from "@/features/settings/constants";
import { useTranslations } from "next-intl";
import styles from "./LanguageSettings.module.scss";

type LanguageSettingsClientProps = {
  tripId: string;
  currentLocale: AppLocale;
};

export function LanguageSettingsClient({
  tripId,
  currentLocale,
}: LanguageSettingsClientProps) {
  const t = useTranslations("Settings");

  return (
    <div className={styles.page}>
      <Link href={buildSettingsHubHref(tripId)} className={styles.back}>
        <IconBack className={styles.backIcon} aria-hidden />
        <span>{t("languagePage.back")}</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{t("rows.language.title")}</h1>
        <p className={styles.lead}>{t("languagePage.lead")}</p>
      </header>

      <section aria-labelledby="interface-language-label">
        <h2 id="interface-language-label" className={styles.sectionLabel}>
          {t("languagePage.sectionTitle")}
        </h2>
        <p className={styles.sectionHint}>{t("languagePage.sectionHint")}</p>
        <div className={styles.group}>
          <InterfaceLanguagePreference
            currentLocale={currentLocale}
            variant="settingsList"
          />
        </div>
      </section>
    </div>
  );
}
