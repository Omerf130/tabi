import Link from "next/link";
import { IconChevron } from "@/components/ui/icons";
import { EntityLinkedCostDisplay } from "@/features/finance/EntityLinkedCostDisplay.client";
import type { TransportCardViewModel } from "./types";
import styles from "./TransportPage.module.scss";

type TransportListRowProps = {
  transport: TransportCardViewModel;
};

function TertiaryLine({ transport }: { transport: TransportCardViewModel }) {
  if (!transport.metaLabel && !transport.linkedCost) {
    return null;
  }

  return (
    <span className={styles.rowMeta} dir="auto">
      {transport.metaLabel}
      {transport.metaLabel && transport.linkedCost ? " · " : null}
      {transport.linkedCost ? (
        <EntityLinkedCostDisplay linkedCost={transport.linkedCost} />
      ) : null}
    </span>
  );
}

export function TransportListRow({ transport }: TransportListRowProps) {
  return (
    <li>
      <Link href={transport.detailHref} className={styles.rowLink}>
        <span className={styles.rowCopy}>
          <span className={styles.rowTitle} dir="auto">
            {transport.listTitle}
          </span>
          <span className={styles.rowSchedule}>
            {transport.dateLabel} · {transport.departureTime}
          </span>
          <span className={styles.rowRoute} dir="ltr">
            {transport.routeLabel}
          </span>
          <TertiaryLine transport={transport} />
        </span>

        <span className={styles.rowVisualWrap} aria-hidden>
          <img
            src={transport.visualSrc}
            alt=""
            className={styles.rowVisual}
            loading="lazy"
          />
        </span>

        <IconChevron className={styles.rowChevron} aria-hidden />
      </Link>
    </li>
  );
}
