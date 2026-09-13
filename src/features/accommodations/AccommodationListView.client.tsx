"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  countAccommodationsByFilter,
  filterAccommodationList,
  type AccommodationListFilter,
} from "./filter-accommodation-list";
import {
  createAccommodationFilterTabs,
  formatAccommodationFilterTabLabel,
  getAccommodationFilterEmptyMessageKey,
} from "./accommodation-labels";
import { AccommodationListRow } from "./AccommodationListRow";
import type { AccommodationListItemViewModel } from "./types";
import styles from "./AccommodationsPage.module.scss";

type AccommodationListViewProps = {
  items: AccommodationListItemViewModel[];
  currentTripDate: string;
  isOwner: boolean;
};

export function AccommodationListView({
  items,
  currentTripDate,
  isOwner,
}: AccommodationListViewProps) {
  const t = useTranslations("Accommodation");
  const [activeFilter, setActiveFilter] = useState<AccommodationListFilter>("all");
  const tabs = useMemo(() => createAccommodationFilterTabs(t), [t]);
  const counts = useMemo(
    () => countAccommodationsByFilter(items, currentTripDate),
    [items, currentTripDate],
  );
  const filteredItems = useMemo(
    () => filterAccommodationList(items, activeFilter, currentTripDate),
    [items, activeFilter, currentTripDate],
  );
  const hasAnyAccommodation = items.length > 0;

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
            {formatAccommodationFilterTabLabel(tab.id, counts[tab.id], t)}
          </button>
        ))}
      </div>

      {!hasAnyAccommodation ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>{t("emptyAll")}</p>
          <p className={styles.emptyHint}>
            {isOwner ? t("emptyAllHintOwner") : t("emptyAllHintGuest")}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.filterEmptyState}>
          <p className={styles.emptyTitle}>
            {t(getAccommodationFilterEmptyMessageKey(activeFilter))}
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {filteredItems.map((item) => (
            <AccommodationListRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
