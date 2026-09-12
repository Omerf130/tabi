"use client";

import { useFormStatus } from "react-dom";
import styles from "./AuthForm.module.scss";

export function AuthSubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={styles.primaryButton}
      disabled={pending}
      aria-busy={pending || undefined}
    >
      <span>{children}</span>
      <span className={styles.primaryArrow} aria-hidden>
        →
      </span>
    </button>
  );
}
