import { AppPage } from "@/features/app-shell/AppPage";
import { AccommodationListView } from "./AccommodationListView.client";
import type { AccommodationListItemViewModel } from "./types";
import styles from "./AccommodationsPage.module.scss";

type AccommodationsPageContentProps = {
  items: AccommodationListItemViewModel[];
  currentTripDate: string;
  isOwner: boolean;
};

export function AccommodationsPageContent({
  items,
  currentTripDate,
  isOwner,
}: AccommodationsPageContentProps) {
  return (
    <AppPage width="content">
      <div className={styles.page}>
        <AccommodationListView
          items={items}
          currentTripDate={currentTripDate}
          isOwner={isOwner}
        />
      </div>
    </AppPage>
  );
}
