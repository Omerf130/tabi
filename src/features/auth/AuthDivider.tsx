import styles from "./AuthDivider.module.scss";

export function AuthDivider() {
  return (
    <div className={styles.divider} role="separator" aria-label="or">
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.label}>or</span>
      <span className={styles.line} aria-hidden="true" />
    </div>
  );
}
