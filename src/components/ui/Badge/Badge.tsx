import type { ReactNode } from "react";
import styles from "./Badge.module.scss";

type BadgeProps = {
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  children: ReactNode;
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}
