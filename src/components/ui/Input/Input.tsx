import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={[styles.control, className].filter(Boolean).join(" ")}
    />
  );
}
