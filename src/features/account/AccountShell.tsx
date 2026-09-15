import Link from "next/link";
import type { ReactNode } from "react";
import { IconBack } from "@/components/ui/icons";
import styles from "./AccountShell.module.scss";

type AccountShellProps = {
  title: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
};

export function AccountShell({
  title,
  backHref,
  backLabel,
  children,
}: AccountShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.headerBar}>
        <Link href={backHref} className={styles.back}>
          <IconBack className={styles.backIcon} aria-hidden />
          <span>{backLabel}</span>
        </Link>
        <h1 className={styles.headerTitle}>{title}</h1>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
