import Link from "next/link";
import type { TripHomeFullDayItinerary } from "./types";
import styles from "./TripHomeContent.module.scss";

type DuringFullDayLinkProps = {
  link: TripHomeFullDayItinerary;
};

export function DuringFullDayLink({ link }: DuringFullDayLinkProps) {
  return (
    <div className={styles.duringFullDayLinkWrap}>
      <Link href={link.href} className={styles.duringFullDayLink}>
        {link.label}
      </Link>
    </div>
  );
}
