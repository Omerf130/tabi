import styles from "./WelcomeScreen.module.scss";

type TabiBrandMarkProps = {
  className?: string;
};

/** Minimal mountain mark — no dedicated Tabi logo asset exists in the project. */
export function TabiBrandMark({ className }: TabiBrandMarkProps) {
  return (
    <svg
      className={[styles.brandMark, className].filter(Boolean).join(" ")}
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
