import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TabiLogo } from "@/features/brand/TabiLogo";
import { OfflineTryAgain } from "@/features/pwa/OfflineTryAgain.client";
import styles from "@/features/pwa/OfflinePage.module.scss";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Offline");

  return {
    title: t("metadataTitle"),
  };
}

export default async function OfflinePage() {
  const t = await getTranslations("Offline");

  return (
    <main className={styles.screen} aria-labelledby="offline-title">
      <div className={styles.content}>
        <TabiLogo variant="auth" className={styles.brandLogo} />
        <h1 id="offline-title" className={styles.title}>
          {t("pageTitle")}
        </h1>
        <p className={styles.body}>{t("pageBody")}</p>
        <div className={styles.actions}>
          <OfflineTryAgain />
        </div>
      </div>
    </main>
  );
}
