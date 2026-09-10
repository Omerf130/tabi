import { IconCurrency } from "@/components/ui/icons";
import styles from "./TravelHub.module.scss";

export const FINANCE_PREVIEW_COPY = {
  title: "הכסף בטיול",
  badge: "בקרוב",
  headline: "ניהול תקציב והוצאות במקום אחד",
  footer: "מעקב תקציב • הוצאות • חלוקה לקטגוריות",
} as const;

export function FinancePreviewCard() {
  return (
    <article
      className={styles.financePreview}
      aria-label={`${FINANCE_PREVIEW_COPY.title} — ${FINANCE_PREVIEW_COPY.badge}`}
    >
      <header className={styles.financePreviewHeader}>
        <span className={styles.financePreviewIconWrap} aria-hidden>
          <IconCurrency className={styles.financePreviewIcon} />
        </span>
        <h3 className={styles.financePreviewTitle}>{FINANCE_PREVIEW_COPY.title}</h3>
        <span className={styles.financePreviewBadge}>{FINANCE_PREVIEW_COPY.badge}</span>
      </header>

      <p className={styles.financePreviewHeadline}>{FINANCE_PREVIEW_COPY.headline}</p>

      <div className={styles.financePreviewDecor} aria-hidden>
        <div className={styles.financePreviewDecorTrack}>
          <span className={styles.financePreviewDecorFill} />
        </div>
        <div className={styles.financePreviewDecorStats}>
          <span className={styles.financePreviewDecorStat} />
          <span className={styles.financePreviewDecorStat} />
        </div>
      </div>

      <p className={styles.financePreviewFooter}>{FINANCE_PREVIEW_COPY.footer}</p>
    </article>
  );
}
