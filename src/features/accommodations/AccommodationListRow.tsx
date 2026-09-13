import Link from "next/link";
import { IconChevron } from "@/components/ui/icons";
import { formatEntityLinkedCostDisplay } from "@/features/finance/entity-linked-cost-presentation";
import type { AccommodationListItemViewModel } from "./types";
import styles from "./AccommodationsPage.module.scss";

type AccommodationListRowProps = {
  item: AccommodationListItemViewModel;
};

export function AccommodationListRow({ item }: AccommodationListRowProps) {
  const hasPhoto = Boolean(item.placePhoto?.hasPhoto && item.placePhoto.photoHref);

  return (
    <li>
      <Link
        href={item.detailHref}
        className={[styles.rowLink, !hasPhoto ? styles.rowLinkNoPhoto : null]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.rowCopy}>
          <span className={styles.rowTitle} dir="auto">
            {item.name}
          </span>
          {item.locationLabel ? (
            <span className={styles.rowLocation} dir="auto">
              {item.locationLabel}
            </span>
          ) : null}
          <span className={styles.rowDates}>{item.dateRangeCompactLabel}</span>
          <span className={styles.rowNights}>{item.nightCountLabel}</span>
          {item.isCurrentStay ? (
            <span className={styles.currentBadge}>עכשיו</span>
          ) : null}
          {item.linkedCost ? (
            <span className={styles.rowMeta} dir="auto">
              {formatEntityLinkedCostDisplay(item.linkedCost)}
            </span>
          ) : null}
        </span>

        {hasPhoto ? (
          <span className={styles.rowVisualWrap} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.placePhoto!.photoHref}
              alt=""
              className={styles.rowVisual}
              loading="lazy"
            />
          </span>
        ) : null}

        <IconChevron className={styles.rowChevron} aria-hidden />
      </Link>
    </li>
  );
}
