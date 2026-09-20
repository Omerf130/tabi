import type { ReactNode } from "react";
import styles from "./ProviderAlertVisual.module.scss";

type ProviderAlertVisualProps = {
  icon?: ReactNode;
  tone?: "error" | "warning";
};

export function ProviderAlertVisual({ icon, tone = "error" }: ProviderAlertVisualProps) {
  return (
    <div className={styles.visual} data-tone={tone} aria-hidden="true">
      <svg className={styles.cloud} viewBox="0 0 48 32" focusable={false}>
        <ellipse cx="18" cy="20" rx="14" ry="10" fill="currentColor" opacity="0.2" />
        <ellipse cx="30" cy="18" rx="16" ry="11" fill="currentColor" opacity="0.16" />
      </svg>
      {icon ? <span className={styles.iconSlot}>{icon}</span> : null}
      <span className={styles.badge} aria-hidden="true">
        !
      </span>
    </div>
  );
}
