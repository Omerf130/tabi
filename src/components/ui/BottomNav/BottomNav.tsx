"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./BottomNav.module.scss";

export type BottomNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
};

type BottomNavProps = {
  items: BottomNavItem[];
  variant?: "bottom" | "rail";
};

export function BottomNav({ items, variant = "bottom" }: BottomNavProps) {
  return (
    <nav
      className={styles.nav}
      data-variant={variant}
      aria-label="ניווט ראשי"
    >
      {items.map((item) => (
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
      ))}
    </nav>
  );
}
