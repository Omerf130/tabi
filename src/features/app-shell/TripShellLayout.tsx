import type { ReactNode } from "react";
import { QuickAddHost } from "@/features/quick-add/QuickAddHost.client";
import { QuickAddProvider } from "@/features/quick-add/QuickAddProvider.client";
import type { QuickAddBootstrap } from "@/features/quick-add/types";
import type { TripThemeKey } from "@/features/trips/theme";
import { TripThemeAtmosphere } from "@/features/trips/theme/TripThemeAtmosphere";
import { TripPrimaryNav } from "./TripPrimaryNav";
import styles from "./TripShellLayout.module.scss";
import type { TripShellContext } from "./types";

type TripShellLayoutProps = TripShellContext & {
  themeKey: TripThemeKey;
  children: ReactNode;
  quickAddBootstrap: QuickAddBootstrap;
};

export function TripShellLayout({
  tripId,
  themeKey,
  children,
  quickAddBootstrap,
}: TripShellLayoutProps) {
  return (
    <QuickAddProvider tripId={tripId} bootstrap={quickAddBootstrap}>
      <div className={styles.themeScope} data-trip-theme={themeKey}>
        <TripThemeAtmosphere themeKey={themeKey} />
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
      </div>
    </QuickAddProvider>
  );
}
