import { MarketingLink } from "./MarketingLink";
import styles from "./landing.module.scss";

const FOOTER_NAV = [
  { href: "#what-is-tabi", label: "מה זה Tabi" },
  { href: "#how-it-works", label: "איך זה עובד" },
  { href: "#whats-waiting", label: "מה מחכה לכם" },
] as const;

export function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrandBlock}>
          <p className={styles.footerBrand}>Tabi</p>
          <p className={styles.footerTagline}>
            תכנון וליווי טיול — הכל במקום אחד, לכל יעד בעולם.
          </p>
        </div>

        <nav className={styles.footerNav} aria-label="ניווט תחתון">
          <ul className={styles.footerNavList}>
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.footerNavLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footerAuth}>
          <MarketingLink href="/login" variant="ghost" className={styles.footerAuthLink}>
            התחברות
          </MarketingLink>
          <MarketingLink href="/register" variant="secondary" className={styles.footerAuthCta}>
            הרשמה
          </MarketingLink>
        </div>
      </div>

      <p className={styles.footerNote}>© {new Date().getFullYear()} Tabi</p>
    </footer>
  );
}
