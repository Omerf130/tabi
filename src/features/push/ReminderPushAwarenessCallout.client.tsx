"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { buildAccountNotificationsHref } from "./account-notifications-routes";
import {
  getReminderPushAwarenessVariant,
  shouldShowReminderPushAwarenessCallout,
} from "./reminder-push-awareness";
import { usePushNotifications } from "./use-push-notifications.client";
import styles from "./ReminderPushAwarenessCallout.module.scss";

type ReminderPushAwarenessCalloutProps = {
  returnTo: string;
};

export function ReminderPushAwarenessCallout({
  returnTo,
}: ReminderPushAwarenessCalloutProps) {
  const t = useTranslations("ReminderNotifications");
  const { uiState } = usePushNotifications();

  if (!shouldShowReminderPushAwarenessCallout(uiState)) {
    return null;
  }

  const variant = getReminderPushAwarenessVariant(uiState);
  if (!variant) {
    return null;
  }

  const href = buildAccountNotificationsHref(returnTo);
  const messageKey =
    variant === "enable"
      ? "calloutInactive"
      : variant === "settings"
        ? "calloutDenied"
        : variant === "install"
          ? "calloutRequiresInstall"
          : "calloutUnsupported";

  const linkKey =
    variant === "enable"
      ? "linkEnable"
      : variant === "settings"
        ? "linkSettings"
        : "linkNotifications";

  return (
    <p className={styles.note} role="note">
      {t(messageKey)}{" "}
      {variant === "unsupported" ? null : (
        <Link className={styles.link} href={href}>
          {t(linkKey)}
        </Link>
      )}
    </p>
  );
}
