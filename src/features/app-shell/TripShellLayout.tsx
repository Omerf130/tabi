import type { ReactNode } from "react";
import { QuickAddHost } from "@/features/quick-add/QuickAddHost.client";
import { QuickAddProvider } from "@/features/quick-add/QuickAddProvider.client";
import type { QuickAddBootstrap } from "@/features/quick-add/types";
import { TripPrimaryNav } from "./TripPrimaryNav";
import styles from "./TripShellLayout.module.scss";
import type { TripShellContext } from "./types";

type TripShellLayoutProps = TripShellContext & {
  children: ReactNode;
  quickAddBootstrap: QuickAddBootstrap;
};

export function TripShellLayout({
  tripId,
  children,
  quickAddBootstrap,
}: TripShellLayoutProps) {
  return (
    <QuickAddProvider tripId={tripId} bootstrap={quickAddBootstrap}>
      <div className={styles.shell}>
        <aside className={styles.railSlot}>
          <TripPrimaryNav tripId={tripId} variant="rail" />
        </aside>
        <div className={styles.mainColumn}>
          <div className={styles.contentArea}>{children}</div>
        </div>
        <div className={styles.bottomNavSlot}>
          <TripPrimaryNav tripId={tripId} variant="bottom" />
        </div>
      </div>
      <QuickAddHost />
    </QuickAddProvider>
  );
}
