import Image from "next/image";
import type { ReactNode } from "react";
import { TabiBrandMark } from "@/features/welcome/TabiBrandMark";
import styles from "./AuthPageShell.module.scss";

type AuthPageShellProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({ title, children, footer }: AuthPageShellProps) {
  return (
    <div className={styles.screen} dir="ltr" lang="en">
      <aside className={styles.visualPanel} aria-hidden="true">
        <div className={styles.visualBackdrop}>
          <div className={styles.visualBlur} />
          <Image
            src="/destination-visuals/homeApp.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
            className={styles.visualImage}
          />
          <div className={styles.visualOverlay} />
        </div>
        <div className={styles.visualBrand}>
          <TabiBrandMark className={styles.visualMark} />
          <p className={styles.visualName}>Tabi</p>
          <p className={styles.visualTagline}>
            Your journey.
            <br />
            Perfectly planned.
          </p>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formInner}>
          <header className={styles.header}>
            <TabiBrandMark className={styles.headerMark} />
            <h1 className={styles.title}>{title}</h1>
          </header>

          <div className={styles.content}>{children}</div>

          {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </div>
      </main>
    </div>
  );
}
