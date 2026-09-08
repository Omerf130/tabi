"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/ui/AppHeader/AppHeader";
import { BottomNav } from "@/components/ui/BottomNav/BottomNav";
import { Button } from "@/components/ui/Button/Button";
import {
  IconBack,
  IconDocuments,
  IconHome,
  IconItinerary,
  IconMemories,
  IconMore,
} from "@/components/ui/icons";
import styles from "./page.module.scss";

type Scheme = "light" | "dark";

type DesignSystemPreviewProps = {
  children: ReactNode;
};

export function DesignSystemPreview({ children }: DesignSystemPreviewProps) {
  const [scheme, setScheme] = useState<Scheme>("light");

  useEffect(() => {
    document.documentElement.dataset.colorScheme = scheme;
    return () => {
      document.documentElement.dataset.colorScheme = "light";
    };
  }, [scheme]);

  const nextScheme: Scheme = scheme === "light" ? "dark" : "light";

  return (
    <div className={styles.shell}>
      <AppHeader
        title="מערכת עיצוב"
        leading={
          <Button variant="ghost" size="icon" aria-label="חזרה">
            <IconBack className={styles.backGlyph} />
          </Button>
        }
        trailing={
          <Button
            variant="ghost"
            size="compact"
            onClick={() => setScheme(nextScheme)}
            aria-pressed={scheme === "dark"}
            aria-label="תצוגת צבעים"
          >
            {scheme === "light" ? "כהה" : "בהיר"}
          </Button>
        }
      />
      <div className={styles.body}>{children}</div>
      <div className={styles.navDock}>
        <BottomNav
          items={[
            {
              id: "home",
              label: "בית",
              href: "#home",
              icon: <IconHome />,
              active: true,
            },
            {
              id: "trip",
              label: "מסלול",
              href: "#trip",
              icon: <IconItinerary />,
            },
            {
              id: "documents",
              label: "מסמכים",
              href: "#documents",
              icon: <IconDocuments />,
            },
            {
              id: "memories",
              label: "זיכרונות",
              href: "#memories",
              icon: <IconMemories />,
            },
            {
              id: "more",
              label: "עוד",
              href: "#more",
              icon: <IconMore />,
            },
          ]}
        />
      </div>
    </div>
  );
}
