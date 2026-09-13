"use client";

import { useMemo, useState } from "react";
import {
  countTransportsByFilter,
  filterTransportList,
  formatTransportFilterTabLabel,
  getTransportFilterEmptyMessage,
  TRANSPORT_FILTER_TABS,
  type TransportListFilter,
} from "./filter-transport-list";
import { TransportListRow } from "./TransportListRow";
import type { TransportCardViewModel } from "./types";
import styles from "./TransportPage.module.scss";

type TransportListViewProps = {
  transports: TransportCardViewModel[];
  isOwner: boolean;
};

export function TransportListView({ transports, isOwner }: TransportListViewProps) {
  const [activeFilter, setActiveFilter] = useState<TransportListFilter>("all");
  const counts = useMemo(() => countTransportsByFilter(transports), [transports]);
  const filteredTransports = useMemo(
    () => filterTransportList(transports, activeFilter),
    [transports, activeFilter],
  );
  const hasAnyTransport = transports.length > 0;

  return (
    <div className={styles.listView}>
      <div className={styles.tabBar} role="tablist" aria-label="סינון תחבורה">
        {TRANSPORT_FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={styles.tabButton}
            data-active={activeFilter === tab.id ? "true" : undefined}
            aria-selected={activeFilter === tab.id}
            onClick={() => setActiveFilter(tab.id)}
          >
            {formatTransportFilterTabLabel(tab.id, counts[tab.id])}
          </button>
        ))}
      </div>

      {!hasAnyTransport ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>אין תחבורה</p>
          <p className={styles.emptyHint}>
            {isOwner
              ? "הוסיפו טיסות, רכבות ונסיעות כדי שיופיעו כאן ובמסלול."
              : "בעל הטיול עדיין לא הוסיף תחבורה."}
          </p>
        </div>
      ) : filteredTransports.length === 0 ? (
        <div className={styles.filterEmptyState}>
          <p className={styles.emptyTitle}>{getTransportFilterEmptyMessage(activeFilter)}</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {filteredTransports.map((transport) => (
            <TransportListRow key={transport.id} transport={transport} />
          ))}
        </ul>
      )}
    </div>
  );
}
