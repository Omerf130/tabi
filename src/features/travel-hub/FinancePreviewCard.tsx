"use client";

import { useTranslations } from "next-intl";
import { IconCurrency } from "@/components/ui/icons";
import styles from "./TravelHub.module.scss";

export function FinancePreviewCard() {
  const t = useTranslations("FinancePreview");

  return (
    <article
      className={styles.financePreview}
      aria-label={`${t("title")} — ${t("badge")}`}
    >
      <header className={styles.financePreviewHeader}>
        <span className={styles.financePreviewIconWrap} aria-hidden>
          <IconCurrency className={styles.financePreviewIcon} />
        </span>
        <h3 className={styles.financePreviewTitle}>{t("title")}</h3>
        <span className={styles.financePreviewBadge}>{t("badge")}</span>
      </header>

      <p className={styles.financePreviewHeadline}>{t("headline")}</p>

      <div className={styles.financePreviewDecor} aria-hidden>
        <div className={styles.financePreviewDecorTrack}>
          <span className={styles.financePreviewDecorFill} />
        </div>
        <div className={styles.financePreviewDecorStats}>
          <span className={styles.financePreviewDecorStat} />
          <span className={styles.financePreviewDecorStat} />
        </div>
      </div>

      <p className={styles.financePreviewFooter}>{t("footer")}</p>
    </article>
  );
}
