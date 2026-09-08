import type { ReactNode } from "react";
import styles from "./AppPage.module.scss";

type AppPageProps = {
  children: ReactNode;
  width?: "content" | "wide";
};

export function AppPage({ children, width = "content" }: AppPageProps) {
  return (
    <div className={styles.page} data-width={width}>
      {children}
    </div>
  );
}
