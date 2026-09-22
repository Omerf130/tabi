import Image from "next/image";
import type { ReactNode } from "react";
import { TabiLogo } from "@/features/brand/TabiLogo";
import { AUTH_BACKGROUND_SRC } from "./auth-visual";
import styles from "./AuthPageShell.module.scss";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  legal?: ReactNode;
};

export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  legal,
}: AuthPageShellProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          src={AUTH_BACKGROUND_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.mainColumn}>
          <header className={styles.brandBlock}>
            <TabiLogo variant="auth" tone="light" priority />
          </header>

          <div className={styles.heroBlock}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <div className={styles.formStack}>{children}</div>

          <div className={styles.scenerySpacer} aria-hidden="true" />

          {footer ? <footer className={styles.footer}>{footer}</footer> : null}
          {legal ? <p className={styles.legal}>{legal}</p> : null}
        </div>
      </div>
    </div>
  );
}
