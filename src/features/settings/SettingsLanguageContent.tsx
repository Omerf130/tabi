import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { getCurrentUser } from "@/features/auth/session";
import { IconBack } from "@/components/ui/icons";
import { InterfaceLanguagePreference } from "@/features/i18n/components/InterfaceLanguagePreference";
import { buildSettingsHubHref } from "./constants";
import styles from "./SettingsHub.module.scss";

type SettingsLanguageContentProps = {
  tripId: string;
};

export async function SettingsLanguageContent({
  tripId,
}: SettingsLanguageContentProps) {
  const [t, user] = await Promise.all([
    getTranslations("Settings"),
    getCurrentUser(),
  ]);

  if (!user) {
    return null;
  }

  return (
    <AppPage width="wide">
      <div className={styles.languagePage}>
        <Link href={buildSettingsHubHref(tripId)} className={styles.languageBack}>
          <IconBack className={styles.languageBackIcon} aria-hidden />
          <span>{t("languagePage.back")}</span>
        </Link>

        <header className={styles.languageHeader}>
          <h1 className={styles.languageTitle}>{t("rows.language.title")}</h1>
          <p className={styles.languageLead}>{t("languagePage.lead")}</p>
        </header>

        <div className={styles.languagePanel}>
          <InterfaceLanguagePreference currentLocale={user.locale} />
        </div>
      </div>
    </AppPage>
  );
}
