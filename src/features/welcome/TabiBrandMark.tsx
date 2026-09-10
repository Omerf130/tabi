import styles from "./WelcomeScreen.module.scss";

/** Minimal mountain mark — no dedicated Tabi logo asset exists in the project. */
export function TabiBrandMark() {
  return (
    <svg
      className={styles.brandMark}
      viewBox="0 0 32 28"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 2 L30 26 H2 Z" fill="currentColor" />
      <path
        d="M16 10 L23 24 H9 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </svg>
  );
}
