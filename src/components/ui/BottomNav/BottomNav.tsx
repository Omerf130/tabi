"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./BottomNav.module.scss";
import quickAddStyles from "@/features/quick-add/QuickAdd.module.scss";

type BottomNavLinkItem = {
  kind: "link";
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
};

type BottomNavActionItem = {
  kind: "action";
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  ariaLabel: string;
};

export type BottomNavItem = BottomNavLinkItem | BottomNavActionItem;

type BottomNavProps = {
  items: BottomNavItem[];
  variant?: "bottom" | "rail";
  ariaLabel: string;
};

export function BottomNav({
  items,
  variant = "bottom",
  ariaLabel,
}: BottomNavProps) {
  return (
    <nav
      className={styles.nav}
      data-variant={variant}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        if (item.kind === "action") {
          if (variant === "bottom") {
            return (
              <div key={item.id} className={quickAddStyles.centerAction}>
                <button
                  type="button"
                  className={quickAddStyles.centerActionButton}
                  aria-label={item.ariaLabel}
                  onClick={item.onClick}
                >
                  {item.icon}
                </button>
                <span className={quickAddStyles.centerActionLabel}>{item.label}</span>
              </div>
            );
          }
          return null;
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={styles.item}
            data-active={item.active ? "true" : undefined}
            aria-current={item.active ? "page" : undefined}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
