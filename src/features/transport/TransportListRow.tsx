import Link from "next/link";
import { IconChevron } from "@/components/ui/icons";
import { formatEntityLinkedCostDisplay } from "@/features/finance/entity-linked-cost-presentation";
import type { TransportCardViewModel } from "./types";
import styles from "./TransportPage.module.scss";

type TransportListRowProps = {
  transport: TransportCardViewModel;
};

function buildTertiaryLine(transport: TransportCardViewModel): string | undefined {
  const parts: string[] = [];
  if (transport.metaLabel) {
    parts.push(transport.metaLabel);
  }
  if (transport.linkedCost) {
    parts.push(formatEntityLinkedCostDisplay(transport.linkedCost));
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function TransportListRow({ transport }: TransportListRowProps) {
  const tertiaryLine = buildTertiaryLine(transport);

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
          {tertiaryLine ? (
            <span className={styles.rowMeta} dir="auto">
              {tertiaryLine}
            </span>
          ) : null}
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
