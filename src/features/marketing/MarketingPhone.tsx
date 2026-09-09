import type { ReactNode } from "react";
import styles from "./MarketingPhone.module.scss";

type MarketingPhoneProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "large";
  tilt?: "none" | "left" | "right";
  layer?: "front" | "back";
};

export function MarketingPhone({
  children,
  className,
  size = "default",
  tilt = "none",
  layer = "front",
}: MarketingPhoneProps) {
  const classes = [styles.phone, className].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      data-size={size}
      data-tilt={tilt}
      data-layer={layer}
      aria-hidden="true"
    >
      <div className={styles.frame}>
        <div className={styles.island} />
        <div className={styles.screen}>
          <div className={styles.statusBar}>
            <span className={styles.statusTime}>9:41</span>
            <span className={styles.statusIcons}>
              <span className={styles.signal} />
              <span className={styles.battery} />
            </span>
          </div>
          <div className={styles.screenContent}>{children}</div>
        </div>
      </div>
    </div>
  );
}
