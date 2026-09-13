import Link from "next/link";
import { IconChevron } from "@/components/ui/icons";
import { SettingsHubRowIcon } from "./SettingsHubRowIcon";
import type { SettingsHubRowViewModel } from "./types";
import styles from "./SettingsHub.module.scss";

type SettingsHubRowProps = {
  row: SettingsHubRowViewModel;
  comingSoonLabel: string;
};

export function SettingsHubRow({ row, comingSoonLabel }: SettingsHubRowProps) {
  const copy = (
    <>
      <span className={styles.rowIconWrap} aria-hidden>
        <SettingsHubRowIcon icon={row.icon} />
      </span>
      <span className={styles.rowCopy}>
        <span className={styles.rowTitle}>{row.title}</span>
        {row.subtitle ? (
          <span className={styles.rowSubtitle}>{row.subtitle}</span>
        ) : null}
      </span>
      {row.comingSoon ? (
        <span className={styles.comingSoonBadge}>{comingSoonLabel}</span>
      ) : (
        <IconChevron className={styles.rowChevron} aria-hidden />
      )}
    </>
  );

  if (row.comingSoon || !row.href) {
    return (
      <div
        className={styles.row}
        data-state="coming-soon"
        data-tone={row.tone ?? "default"}
        aria-disabled="true"
      >
        {copy}
      </div>
    );
  }

  return (
    <Link
      href={row.href}
      className={styles.row}
      data-state="active"
      data-tone={row.tone ?? "default"}
    >
      {copy}
    </Link>
  );
}
