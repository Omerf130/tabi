import type { ReactNode } from "react";
import { GlobalAppHeader } from "./TripHeader";
import styles from "./GlobalAppShell.module.scss";

type GlobalAppShellProps = {
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
};

export function GlobalAppShell({
  title,
  trailing,
  children,
}: GlobalAppShellProps) {
  return (
    <div className={styles.shell}>
      <GlobalAppHeader title={title} trailing={trailing} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
