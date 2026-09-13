"use client";

import { useMemo, useState } from "react";
import {
  ACCOMMODATION_FILTER_TABS,
  countAccommodationsByFilter,
  filterAccommodationList,
  formatAccommodationFilterTabLabel,
  getAccommodationFilterEmptyMessage,
  type AccommodationListFilter,
} from "./filter-accommodation-list";
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
  const [activeFilter, setActiveFilter] = useState<AccommodationListFilter>("all");
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
      <div className={styles.tabBar} role="tablist" aria-label="סינון מקומות לינה">
        {ACCOMMODATION_FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={styles.tabButton}
            data-active={activeFilter === tab.id ? "true" : undefined}
            aria-selected={activeFilter === tab.id}
            onClick={() => setActiveFilter(tab.id)}
          >
            {formatAccommodationFilterTabLabel(tab.id, counts[tab.id])}
          </button>
        ))}
      </div>

      {!hasAnyAccommodation ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>אין מקומות לינה</p>
          <p className={styles.emptyHint}>
            {isOwner
              ? "הוסיפו מקומות לינה כדי שיופיעו כאן ובמסלול."
              : "בעל הטיול עדיין לא הוסיף מקומות לינה."}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.filterEmptyState}>
          <p className={styles.emptyTitle}>
            {getAccommodationFilterEmptyMessage(activeFilter)}
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
