import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PwaInstallAction } from "@/features/pwa-install/PwaInstallAction.client";
import { TabiBrandMark } from "./TabiBrandMark";
import styles from "./WelcomeScreen.module.scss";

export async function WelcomeScreen() {
  const t = await getTranslations("Welcome");

  return (
    <section className={styles.screen} aria-labelledby="welcome-brand">
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropBlur} />
        <Image
          src="/destination-visuals/homeApp.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <header className={styles.brandBlock}>
          <TabiBrandMark />
          <h1 id="welcome-brand" className={styles.brandName}>
            {t("brandName")}
          </h1>
          <p className={styles.tagline}>
            {t("taglineLine1")}
            <br />
            {t("taglineLine2")}
          </p>
        </header>

        <div className={styles.actions}>
          <Link href="/register" className={styles.primaryCta}>
            {t("getStarted")}
          </Link>
          <p className={styles.signIn}>
            {t("signInPrompt")}{" "}
            <Link href="/login" className={styles.signInLink}>
              {t("signInLink")}
            </Link>
          </p>
          <PwaInstallAction appearance="welcome" />
        </div>
      </div>
    </section>
  );
}
