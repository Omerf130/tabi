"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import styles from "./ConnectivityBanner.module.scss";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

export function shouldShowConnectivityBanner(isOnline: boolean): boolean {
  return !isOnline;
}

export function ConnectivityBanner() {
  const t = useTranslations("Offline");
  const isOnline = useSyncExternalStore(
    subscribe,
    getOnlineSnapshot,
    getServerSnapshot,
  );

  if (!shouldShowConnectivityBanner(isOnline)) {
    return null;
  }

  return (
    <div
      className={styles.banner}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className={styles.title}>{t("bannerTitle")}</p>
      <p className={styles.subtitle}>{t("bannerSubtitle")}</p>
    </div>
  );
}
