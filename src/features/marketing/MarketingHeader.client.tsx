"use client";

import { useEffect, useId, useState } from "react";
import { MarketingLink } from "./MarketingLink";
import styles from "./landing.module.scss";

const NAV_ITEMS = [
  { href: "#what-is-tabi", label: "מה זה Tabi" },
  { href: "#how-it-works", label: "איך זה עובד" },
  { href: "#whats-waiting", label: "מה מחכה לכם" },
] as const;

export function MarketingHeaderClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <MarketingLink href="/" variant="ghost" className={styles.brand} aria-label="Tabi — דף הבית">
          Tabi
        </MarketingLink>

        <nav className={styles.desktopNav} aria-label="ניווט ראשי">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.headerActions}>
          <MarketingLink href="/login" variant="ghost" className={styles.headerAuthLink}>
            התחברות
          </MarketingLink>
          <MarketingLink href="/register" variant="primary" className={styles.headerCta}>
            הרשמה
          </MarketingLink>
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>
      </div>

      <div
        id={menuId}
        className={styles.mobileNav}
        data-open={menuOpen ? "true" : undefined}
        hidden={!menuOpen}
      >
        <nav aria-label="ניווט נייד">
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <MarketingLink
                href="/login"
                variant="secondary"
                className={styles.mobileNavCta}
                onClick={() => setMenuOpen(false)}
              >
                התחברות
              </MarketingLink>
            </li>
            <li>
              <MarketingLink
                href="/register"
                variant="primary"
                className={styles.mobileNavCta}
                onClick={() => setMenuOpen(false)}
              >
                הרשמה
              </MarketingLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
