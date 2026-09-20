"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { usePushNotifications } from "./use-push-notifications.client";
import styles from "./NotificationsSettings.module.scss";

export function NotificationsSettingsClient() {
  const t = useTranslations("AccountNotifications");
  const { uiState, busy, actionError, enable, disable } = usePushNotifications();

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
        <div className={styles.statusCard}>
          <p className={styles.statusText}>{statusMessage}</p>
        </div>
      </section>

      {actionError ? (
        <p className={styles.error} role="alert">
          {t("errors.generic")}
        </p>
      ) : null}

      <div className={styles.actions}>
        {showEnable ? (
          <Button type="button" onClick={() => void enable()} disabled={busy}>
            {t("actions.enable")}
          </Button>
        ) : null}
        {showDisable ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void disable()}
            disabled={busy}
          >
            {t("actions.disableDevice")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
