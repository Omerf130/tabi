import type { ReactNode } from "react";
import styles from "./AppPage.module.scss";

type AppPageProps = {
  children: ReactNode;
  width?: "content" | "wide";
  density?: "default" | "compact";
  /** Trip Home: hero flush to workspace top on mobile (no page padding-top). */
  flushTop?: boolean;
};

export function AppPage({
  children,
  width = "content",
  density = "default",
  flushTop = false,
}: AppPageProps) {
  return (
    <div
      className={styles.page}
      data-width={width}
      data-density={density}
      data-flush-top={flushTop ? "true" : undefined}
    >
      {children}
    </div>
  );
}
