"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore, useId } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import {
  shouldEnableUpdateNow,
  shouldShowSwUpdatePrompt,
} from "./sw-update-state";
import { useSerwistUpdate } from "./useSerwistUpdate";
import styles from "./SwUpdatePrompt.module.scss";

function subscribeOnline(onStoreChange: () => void) {
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

function getServerOnlineSnapshot(): boolean {
  return true;
}

function useIsOnline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );
}

function useTripBottomNavOffset(): boolean {
  const pathname = usePathname();
  return pathname.startsWith("/app");
}

export function SwUpdatePrompt() {
  const t = useTranslations("SwUpdate");
  const titleId = useId();
  const isOnline = useIsOnline();
  const reserveTripNav = useTripBottomNavOffset();
  const {
    hasWaitingWorker,
    isFirstInstallWaiting,
    dismissedForSession,
    isApplyingUpdate,
    dismissForNow,
    applyUpdate,
  } = useSerwistUpdate();

  const visible = shouldShowSwUpdatePrompt({
    hasWaitingWorker,
    isFirstInstallWaiting,
    dismissedForSession,
    isApplyingUpdate,
  });

  const updateEnabled = shouldEnableUpdateNow(isOnline, isApplyingUpdate);

  if (!visible) {
    return null;
  }

  return (
    <section
      className={styles.card}
      data-trip-nav={reserveTripNav ? "true" : undefined}
      role="region"
      aria-labelledby={titleId}
      aria-live="polite"
    >
      <h2 id={titleId} className={styles.title}>
        {t("title")}
      </h2>
      <p className={styles.body}>{t("body")}</p>
      <div className={styles.actions}>
        <Button
          type="button"
          variant="primary"
          className={styles.primaryAction}
          disabled={!updateEnabled}
          loading={isApplyingUpdate}
          aria-busy={isApplyingUpdate || undefined}
          onClick={() => {
            void applyUpdate();
          }}
        >
          {t("primary")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isApplyingUpdate}
          onClick={dismissForNow}
        >
          {t("secondary")}
        </Button>
      </div>
    </section>
  );
}
