import { AppPage } from "@/features/app-shell/AppPage";
import { flattenTransportCards } from "./flatten-transport-cards";
import { TransportAddMenu } from "./TransportAddMenu.client";
import { TransportListView } from "./TransportListView.client";
import type { TransportType } from "./transport-types";
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
  const transports = flattenTransportCards(groupedTransports);

  const content = (
    <div className={embedded ? styles.embedded : styles.page}>
      {isOwner && embedded ? (
        <div className={styles.embeddedActions}>
          <TransportAddMenu tripId={tripId} variant="embedded" />
        </div>
      ) : null}
      <TransportListView transports={transports} isOwner={isOwner} />
    </div>
  );

  if (embedded) {
    return content;
  }

  return <AppPage width="content">{content}</AppPage>;
}
