import type { SelectHTMLAttributes } from "react";
import styles from "./Select.module.scss";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={[styles.control, className].filter(Boolean).join(" ")}
    >
      {children}
    </select>
  );
}
