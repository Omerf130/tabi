"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button/Button";
import { ProviderAlertVisual } from "./ProviderAlertVisual";
import styles from "./ProviderAlert.module.scss";

export type ProviderAlertProps = {
  icon?: ReactNode;
  title?: ReactNode;
  message: ReactNode;
  /** Retry or recovery action — rendered as a compact button when provided. */
  retryAction?: {
    label: ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    label: ReactNode;
    href?: string;
    onClick?: () => void;
  };
  tone?: "error" | "warning";
  className?: string;
};

export function ProviderAlert({
  icon,
  title,
  message,
  retryAction,
  secondaryAction,
  tone = "error",
  className,
}: ProviderAlertProps) {
  const rootClass = [styles.alert, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} role="alert" data-tone={tone}>
      <div className={styles.alertRow}>
        {icon ? <ProviderAlertVisual icon={icon} tone={tone} /> : null}
        <div className={styles.copy}>
          {title ? <p className={styles.title}>{title}</p> : null}
          <p className={styles.message}>{message}</p>
        </div>
      </div>
      {retryAction || secondaryAction ? (
        <div className={styles.actions}>
          {retryAction ? (
            <Button type="button" variant="secondary" size="compact" onClick={retryAction.onClick}>
              {retryAction.label}
            </Button>
          ) : null}
          {secondaryAction?.href ? (
            <a href={secondaryAction.href} className={styles.secondaryLink}>
              {secondaryAction.label}
            </a>
          ) : secondaryAction?.onClick ? (
            <button type="button" className={styles.secondaryLinkButton} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
