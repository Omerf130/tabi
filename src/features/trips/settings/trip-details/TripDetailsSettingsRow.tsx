import Link from "next/link";
import type { ReactNode } from "react";
import { IconChevron } from "@/components/ui/icons";
import styles from "./TripDetailsSettings.module.scss";

type TripDetailsSettingsRowProps = {
  label: string;
  value: string;
  icon: ReactNode;
  valueMuted?: boolean;
  href?: string;
  onPress?: () => void;
  showChevron?: boolean;
  dir?: "auto" | "ltr";
};

export function TripDetailsSettingsRow({
  label,
  value,
  icon,
  valueMuted = false,
  href,
  onPress,
  showChevron = false,
  dir = "auto",
}: TripDetailsSettingsRowProps) {
  const copy = (
    <>
      <span className={styles.rowIconWrap} aria-hidden>
        {icon}
      </span>
      <span className={styles.rowCopy}>
        <span className={styles.rowLabel}>{label}</span>
        <span
          className={valueMuted ? styles.rowValueMuted : styles.rowValue}
          dir={dir}
        >
          {value}
        </span>
      </span>
      {showChevron ? (
        <IconChevron className={styles.rowChevron} aria-hidden />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.row} data-interactive="true" role="listitem">
        {copy}
      </Link>
    );
  }

  if (onPress) {
    return (
      <button
        type="button"
        className={styles.row}
        data-interactive="true"
        onClick={onPress}
      >
        {copy}
      </button>
    );
  }

  return (
    <div className={styles.row} data-interactive="false" role="listitem">
      {copy}
    </div>
  );
}
