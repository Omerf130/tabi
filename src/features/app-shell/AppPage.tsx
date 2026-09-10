import type { ReactNode } from "react";
import styles from "./AppPage.module.scss";

type AppPageProps = {
  children: ReactNode;
  width?: "content" | "wide";
  density?: "default" | "compact";
};

export function AppPage({
  children,
  width = "content",
  density = "default",
}: AppPageProps) {
  return (
    <div className={styles.page} data-width={width} data-density={density}>
      {children}
    </div>
  );
}
