import type { TripListProgress } from "./types";
import styles from "./ListProgressBar.module.scss";

type ListProgressBarProps = {
  progress: TripListProgress;
  label: string;
  title?: string;
};

export function progressPercent(progress: TripListProgress): number {
  if (progress.totalCount === 0) {
    return 0;
  }
  return Math.round((progress.completedCount / progress.totalCount) * 100);
}

export function ListProgressBar({ progress, label, title }: ListProgressBarProps) {
  const percent = progressPercent(progress);

  return (
    <>
      <p className={styles.label}>{label}</p>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={title ? `${title}: ${label}` : label}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </>
  );
}
