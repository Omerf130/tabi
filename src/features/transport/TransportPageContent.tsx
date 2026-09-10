import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { IconChevron } from "@/components/ui/icons";
import { AppPage } from "@/features/app-shell/AppPage";
import { formatEntityLinkedCostDisplay } from "@/features/finance/entity-linked-cost-presentation";
import {
  buildTransportNewHref,
  getAddTransportTypeLabel,
} from "./constants";
import {
  TRANSPORT_TYPES,
  TRANSPORT_TYPE_LABELS,
  type TransportType,
} from "./transport-types";
import type { TransportCardViewModel } from "./types";
import styles from "./TransportPage.module.scss";

type TransportPageContentProps = {
  tripId: string;
  groupedTransports: Record<TransportType, TransportCardViewModel[]>;
  isOwner: boolean;
  embedded?: boolean;
};

export function TransportPageContent({
  tripId,
  groupedTransports,
  isOwner,
  embedded = false,
}: TransportPageContentProps) {
  const populatedTypes = TRANSPORT_TYPES.filter(
    (type) => groupedTransports[type].length > 0,
  );
  const hasAnyTransport = populatedTypes.length > 0;

  const content = (
    <>
      {!hasAnyTransport ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>אין תחבורה</p>
          <p className={styles.emptyHint}>
            {isOwner
              ? "הוסיפו טיסות, רכבות ונסיעות כדי שיופיעו כאן ובמסלול."
              : "בעל הטיול עדיין לא הוסיף תחבורה."}
          </p>
        </div>
      ) : (
        <div className={styles.sections}>
          {populatedTypes.map((type) => (
            <section key={type} className={styles.section}>
              <h2 className={styles.sectionTitle}>{TRANSPORT_TYPE_LABELS[type]}</h2>
              <ul className={styles.list}>
                {groupedTransports[type].map((transport) => (
                  <li key={transport.id}>
                    <Link href={transport.detailHref} className={styles.cardLink}>
                      <Card variant="standard">
                        <div className={styles.cardBody}>
                          <div className={styles.cardMain}>
                            <p className={styles.cardRoute} dir="auto">
                              {transport.routeLabel}
                            </p>
                            {transport.metaLabel ? (
                              <p className={styles.cardMeta} dir="auto">
                                {transport.metaLabel}
                              </p>
                            ) : null}
                            {transport.linkedCost ? (
                              <p className={styles.cardMeta}>
                                {formatEntityLinkedCostDisplay(transport.linkedCost)}
                              </p>
                            ) : null}
                            <p className={styles.cardDate}>{transport.dateLabel}</p>
                            <p className={styles.cardTime}>{transport.timeRangeLabel}</p>
                          </div>
                          <IconChevron className={styles.cardChevron} aria-hidden />
                        </div>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {isOwner ? (
        <section className={styles.addBlock} aria-label="הוספת תחבורה">
          <h2 className={styles.addTitle}>הוספת תחבורה</h2>
          <div className={styles.addGrid}>
            {TRANSPORT_TYPES.map((type) => (
              <Link
                key={type}
                href={buildTransportNewHref(tripId, type)}
                className={styles.addLink}
              >
                {getAddTransportTypeLabel(type)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className={styles.embedded}>{content}</div>;
  }

  return <AppPage width="content">{content}</AppPage>;
}
