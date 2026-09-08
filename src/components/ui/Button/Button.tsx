import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "compact" | "icon";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "default",
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(" ");

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
    >
      <span className={styles.label}>{children}</span>
    </button>
  );
}
