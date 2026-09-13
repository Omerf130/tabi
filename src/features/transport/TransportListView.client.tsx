"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  countTransportsByFilter,
  filterTransportList,
  type TransportListFilter,
} from "./filter-transport-list";
import {
  createTransportFilterTabs,
  formatTransportFilterTabLabel,
  getTransportFilterEmptyMessageKey,
} from "./transport-labels";
import { TransportListRow } from "./TransportListRow";
import type { TransportCardViewModel } from "./types";
import styles from "./TransportPage.module.scss";

type TransportListViewProps = {
  transports: TransportCardViewModel[];
  isOwner: boolean;
};

export function TransportListView({ transports, isOwner }: TransportListViewProps) {
  const t = useTranslations("Transport");
  const [activeFilter, setActiveFilter] = useState<TransportListFilter>("all");
  const tabs = useMemo(() => createTransportFilterTabs(t), [t]);
  const counts = useMemo(() => countTransportsByFilter(transports), [transports]);
  const filteredTransports = useMemo(
    () => filterTransportList(transports, activeFilter),
    [transports, activeFilter],
  );
  const hasAnyTransport = transports.length > 0;

  return (
    <div className={styles.listView}>
      <div className={styles.tabBar} role="tablist" aria-label={t("filterAria")}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={styles.tabButton}
            data-active={activeFilter === tab.id ? "true" : undefined}
            aria-selected={activeFilter === tab.id}
            onClick={() => setActiveFilter(tab.id)}
          >
            {formatTransportFilterTabLabel(tab.id, counts[tab.id], t)}
          </button>
        ))}
      </div>

      {!hasAnyTransport ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>{t("emptyAll")}</p>
          <p className={styles.emptyHint}>
            {isOwner ? t("emptyAllHintOwner") : t("emptyAllHintGuest")}
          </p>
        </div>
      ) : filteredTransports.length === 0 ? (
        <div className={styles.filterEmptyState}>
          <p className={styles.emptyTitle}>
            {t(getTransportFilterEmptyMessageKey(activeFilter))}
          </p>
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
