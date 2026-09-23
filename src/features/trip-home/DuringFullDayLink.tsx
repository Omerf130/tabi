import Link from "next/link";
import { IconChevron } from "@/components/ui/icons";
import type { TripHomeFullDayItinerary } from "./types";
import styles from "./TripHomeContent.module.scss";

type DuringFullDayLinkProps = {
  link: TripHomeFullDayItinerary;
};

export function DuringFullDayLink({ link }: DuringFullDayLinkProps) {
  return (
    <div className={styles.duringFullDayLinkWrap}>
      <Link href={link.href} className={styles.duringFullDayLink}>
        <span>{link.label}</span>
        <IconChevron className={styles.duringFullDayChevron} aria-hidden />
      </Link>
    </div>
  );
}
