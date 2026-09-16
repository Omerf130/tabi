import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OfflineTryAgain } from "@/features/pwa/OfflineTryAgain.client";
import styles from "@/features/pwa/OfflinePage.module.scss";
import { TabiBrandMark } from "@/features/welcome/TabiBrandMark";

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
        <TabiBrandMark className={styles.brandMark} />
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
