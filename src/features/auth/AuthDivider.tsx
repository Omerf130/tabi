"use client";

import { useTranslations } from "next-intl";
import styles from "./AuthDivider.module.scss";

export function AuthDivider() {
  const t = useTranslations("Auth.actions");

  return (
    <div className={styles.divider} role="separator" aria-label={t("or")}>
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.label}>{t("or")}</span>
      <span className={styles.line} aria-hidden="true" />
    </div>
  );
}
