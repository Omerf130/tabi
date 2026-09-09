import styles from "./RouteDecoration.module.scss";

type RouteDecorationProps = {
  variant?: "dots" | "curve" | "pin";
  className?: string;
};

export function RouteDecoration({ variant = "dots", className }: RouteDecorationProps) {
  const classes = [styles.decoration, className].filter(Boolean).join(" ");

  if (variant === "curve") {
    return (
      <svg
        className={classes}
        data-variant={variant}
        viewBox="0 0 200 80"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M10 60 C 50 20, 100 70, 190 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeLinecap="round"
        />
        <circle cx="190" cy="15" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (variant === "pin") {
    return (
      <svg
        className={classes}
        data-variant={variant}
        viewBox="0 0 24 32"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 2c-4 0-7 3-7 7 0 5.5 7 13 7 13s7-7.5 7-13c0-4-3-7-7-7Z"
          fill="currentColor"
          opacity="0.35"
        />
        <circle cx="12" cy="9" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      className={classes}
      data-variant={variant}
      viewBox="0 0 120 24"
      aria-hidden="true"
      focusable="false"
    >
      <line
        x1="4"
        y1="12"
        x2="116"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
      <circle cx="4" cy="12" r="3" fill="currentColor" />
      <circle cx="60" cy="12" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="116" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
