import type { ReactNode } from "react";
import styles from "./Card.module.scss";

type CardProps = {
  variant?: "standard" | "elevated" | "subtle" | "emphasized";
  children: ReactNode;
};

export function Card({ variant = "standard", children }: CardProps) {
  return (
    <div className={styles.card} data-variant={variant}>
      {children}
    </div>
  );
}
