"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { PwaInstallAction } from "@/features/pwa-install/PwaInstallAction.client";
import type { PushSubscriptionErrorCode } from "./constants";
import { usePushNotifications } from "./use-push-notifications.client";
import styles from "./NotificationsSettings.module.scss";

function resolveActionErrorMessage(
  t: ReturnType<typeof useTranslations<"AccountNotifications">>,
  code: PushSubscriptionErrorCode | null,
): string {
  if (!code) {
    return t("errors.generic");
  }

  switch (code) {
    case "invalidInput":
      return t("errors.invalidInput");
    case "vapidNotConfigured":
      return t("errors.vapidNotConfigured");
    case "forbidden":
      return t("errors.forbidden");
    default:
      return t("errors.generic");
  }
}

export function NotificationsSettingsClient() {
  const t = useTranslations("AccountNotifications");
  const { uiState, busy, actionError, actionErrorCode, enable, disable } =
    usePushNotifications();

  const isLoading = uiState === "loading" || busy;

  const statusMessage = (() => {
    switch (uiState) {
      case "loading":
        return t("status.loading");
      case "unsupported":
        return t("status.unsupported");
      case "requiresInstall":
        return t("status.requiresInstall");
      case "permissionDenied":
        return t("status.permissionDenied");
      case "permissionDefault":
        return t("status.permissionDefault");
      case "subscribed":
        return t("status.subscribed");
      case "notSubscribed":
        return t("status.notSubscribed");
      case "error":
        return t("status.error");
      default:
        return t("status.loading");
    }
  })();

  const showEnable =
    uiState === "permissionDefault" ||
    uiState === "notSubscribed" ||
    (uiState === "error" && !busy);

  const showDisable = uiState === "subscribed";

  return (
    <div className={styles.page}>
      <p className={styles.lead}>{t("lead")}</p>

      <section aria-labelledby="push-device-status-label">
        <h2 id="push-device-status-label" className={styles.sectionLabel}>
          {t("deviceSectionTitle")}
        </h2>
        <div
          className={styles.statusCard}
          aria-live="polite"
          aria-busy={isLoading}
        >
          <p className={styles.statusText}>{statusMessage}</p>
          {uiState === "permissionDenied" ? (
            <p className={styles.statusHint}>{t("deniedHint")}</p>
          ) : null}
        </div>
      </section>

      {uiState === "requiresInstall" ? (
        <div className={styles.installAction}>
          <PwaInstallAction />
        </div>
      ) : null}

      {actionError ? (
        <p className={styles.error} role="alert">
          {resolveActionErrorMessage(t, actionErrorCode)}
        </p>
      ) : null}

      <div className={styles.actions}>
        {showEnable ? (
          <Button type="button" onClick={() => void enable()} disabled={busy}>
            {t("actions.enable")}
          </Button>
        ) : null}
        {showDisable ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void disable()}
              disabled={busy}
            >
              {t("actions.disableDevice")}
            </Button>
            <p className={styles.disableHint}>{t("disableHint")}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
