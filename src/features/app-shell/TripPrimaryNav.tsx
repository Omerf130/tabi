"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BottomNav, type BottomNavItem } from "@/components/ui/BottomNav/BottomNav";
import {
  IconGear,
  IconHome,
  IconItinerary,
  IconMore,
  IconPlus,
} from "@/components/ui/icons";
import { useQuickAdd } from "@/features/quick-add/QuickAddProvider.client";
import {
  buildTripNavHref,
  getActiveNavSection,
  MOBILE_BOTTOM_NAV_SLOTS,
  NAV_SECTIONS,
  type NavSection,
} from "./navigation";
import styles from "./TripPrimaryNav.module.scss";
import quickAddStyles from "@/features/quick-add/QuickAdd.module.scss";

const NAV_ICONS = {
  home: IconHome,
  itinerary: IconItinerary,
  settings: IconGear,
  more: IconMore,
} as const;

type TripPrimaryNavProps = {
  tripId: string;
  variant: "bottom" | "rail";
};

export function TripPrimaryNav({ tripId, variant }: TripPrimaryNavProps) {
  const pathname = usePathname();
  const activeSection = getActiveNavSection(pathname, tripId);
  const t = useTranslations("Navigation");
  const tQuickAdd = useTranslations("QuickAdd");
  const { open: openQuickAdd } = useQuickAdd();

  const openGlobalQuickAdd = () => {
    openQuickAdd({ context: { originPath: pathname } });
  };

  if (variant === "bottom") {
    const items: BottomNavItem[] = MOBILE_BOTTOM_NAV_SLOTS.map((slot) => {
      if (slot === "quick-add") {
        return {
          kind: "action",
          id: "quick-add",
          label: tQuickAdd("navLabel"),
          icon: <IconPlus className={quickAddStyles.centerActionIcon} aria-hidden />,
          onClick: openGlobalQuickAdd,
          ariaLabel: tQuickAdd("openAria"),
        };
      }
      const section = slot as NavSection;
      const Icon = NAV_ICONS[section];
      return {
        kind: "link",
        id: section,
        label: t(section satisfies NavSection),
        href: buildTripNavHref(tripId, section),
        icon: <Icon />,
        active: activeSection === section,
      };
    });

    return <BottomNav items={items} variant={variant} ariaLabel={t("ariaLabel")} />;
  }

  const items: BottomNavItem[] = NAV_SECTIONS.map((section) => {
    const Icon = NAV_ICONS[section];
    return {
      kind: "link",
      id: section,
      label: t(section satisfies NavSection),
      href: buildTripNavHref(tripId, section),
      icon: <Icon />,
      active: activeSection === section,
    };
  });

  return (
    <div className={styles.rail}>
      <div className={styles.brand} aria-hidden>
        Tabi
      </div>
      <div className={quickAddStyles.railQuickAdd}>
        <button
          type="button"
          className={quickAddStyles.railQuickAddButton}
          onClick={openGlobalQuickAdd}
        >
          <IconPlus aria-hidden />
          <span>{tQuickAdd("desktopAdd")}</span>
        </button>
      </div>
      <div className={styles.navWrap}>
        <BottomNav items={items} variant="rail" ariaLabel={t("ariaLabel")} />
      </div>
    </div>
  );
}
