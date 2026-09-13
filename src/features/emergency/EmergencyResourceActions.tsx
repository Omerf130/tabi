"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { EmergencyResourceAction } from "./types";
import styles from "./EmergencyPage.module.scss";

type EmergencyResourceActionsProps = {
  actions: EmergencyResourceAction[];
  primary?: boolean;
};

export function EmergencyResourceActions({
  actions,
  primary = false,
}: EmergencyResourceActionsProps) {
  const t = useTranslations("Emergency");
  const [copyMessage, setCopyMessage] = useState<string | undefined>();

  if (actions.length === 0) {
    return null;
  }

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(t("errors.copySuccess"));
    } catch {
      setCopyMessage(t("errors.copyFailed"));
    }
  }

  return (
    <div className={styles.actions}>
      {actions.map((action) => {
        if (action.type === "copy") {
          return (
            <button
              key={`copy-${action.value}`}
              type="button"
              className={styles.actionButton}
              onClick={() => handleCopy(action.value)}
            >
              {action.label}
            </button>
          );
        }

        const className = primary && action.type === "phone"
          ? styles.actionButtonPrimary
          : styles.actionButton;

        return (
          <a
            key={`${action.type}-${action.value}`}
            href={action.href}
            className={className}
            {...(action.type === "url" || action.type === "address"
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {action.label}
          </a>
        );
      })}
      {copyMessage ? <span className={styles.resourceMeta}>{copyMessage}</span> : null}
    </div>
  );
}
