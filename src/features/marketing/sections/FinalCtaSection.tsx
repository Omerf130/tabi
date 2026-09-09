import { MarketingLink } from "../MarketingLink";
import styles from "../landing.module.scss";

export function FinalCtaSection() {
  return (
    <section className={styles.finalCta} aria-labelledby="final-cta-heading">
      <div className={styles.finalCtaPanel}>
        <div className={styles.finalCtaGlow} aria-hidden="true" />
        <h2 id="final-cta-heading" className={styles.finalCtaTitle}>
          פחות לחפש.
          <br />
          יותר לטייל.
        </h2>
        <p className={styles.finalCtaLead}>
          הטיול הבא שלכם יכול להתחיל הרבה יותר מסודר.
        </p>
        <div className={styles.finalCtaActions}>
          <MarketingLink href="/register" variant="primary" className={styles.finalCtaPrimary}>
            יוצרים טיול ראשון
          </MarketingLink>
          <MarketingLink href="/login" variant="ghost" className={styles.finalCtaSecondary}>
            כבר יש לי חשבון
          </MarketingLink>
        </div>
      </div>
    </section>
  );
}
