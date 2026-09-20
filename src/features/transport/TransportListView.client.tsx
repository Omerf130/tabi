"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconPlane, IconSearch, IconTrain } from "@/components/ui/icons";
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
        <EmptyState
          variant="section"
          className={styles.listEmptyState}
          surface="subtle-bordered"
          visual={{
            motif: "transport",
            icon: <IconTrain aria-hidden />,
            accentIcon: <IconPlane aria-hidden />,
          }}
          title={t("emptyAll")}
          description={isOwner ? t("emptyAllHintOwner") : t("emptyAllHintGuest")}
        />
      ) : filteredTransports.length === 0 ? (
        <EmptyState
          variant="search"
          className={styles.listEmptyState}
          visual={{ motif: "search", icon: <IconSearch aria-hidden /> }}
          title={t(getTransportFilterEmptyMessageKey(activeFilter))}
          description={t("emptyFilterHint")}
          primaryAction={{
            label: t("emptyFilterShowAll"),
            onClick: () => setActiveFilter("all"),
          }}
        />
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
