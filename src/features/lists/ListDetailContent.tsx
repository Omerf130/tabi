import { AppPage } from "@/features/app-shell/AppPage";
import { ListChecklist } from "./ListChecklist.client";
import type { TripListDetailViewModel } from "./types";
import styles from "./ListDetail.module.scss";

type ListDetailContentProps = {
  tripId: string;
  list: TripListDetailViewModel;
};

export function ListDetailContent({ tripId, list }: ListDetailContentProps) {
  return (
    <AppPage width="content">
      <div className={styles.header}>
        <p className={styles.progressLabel}>{list.progressLabel}</p>
      </div>
      <ListChecklist
        tripId={tripId}
        listType={list.type}
        initialItems={list.items}
      />
    </AppPage>
  );
}
