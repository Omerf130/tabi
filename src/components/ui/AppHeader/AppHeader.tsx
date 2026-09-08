import type { ReactNode } from "react";
import styles from "./AppHeader.module.scss";

type AppHeaderProps = {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  align?: "start" | "center";
  borderless?: boolean;
  className?: string;
  titleClassName?: string;
};

export function AppHeader({
  title,
  leading,
  trailing,
  align = "center",
  borderless = false,
  className,
  titleClassName,
}: AppHeaderProps) {
  const headerClassName = [styles.header, className].filter(Boolean).join(" ");

  return (
    <header
      className={headerClassName}
      data-align={align}
      data-borderless={borderless ? "true" : undefined}
    >
      <div className={styles.side}>{leading}</div>
      <h1 className={[styles.title, titleClassName].filter(Boolean).join(" ")}>
        {title}
      </h1>
      <div className={styles.side}>{trailing}</div>
    </header>
  );
}
