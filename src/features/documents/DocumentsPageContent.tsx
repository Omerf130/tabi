"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconAccommodation,
  IconActivityAttraction,
  IconCalendar,
  IconChevron,
  IconDocuments,
  IconFileImage,
  IconFilePdf,
  IconGrid,
  IconLink,
  IconMore,
  IconPlane,
  IconShield,
  IconTicket,
  IconTrain,
} from "@/components/ui/icons";
import { AppPage } from "@/features/app-shell/AppPage";
import japanWalletHero from "@/assets/pics/ChatGPT Image Sep 8, 2026, 08_41_47 PM.png";
import walletBottomArtwork from "@/assets/pics/ChatGPT Image Sep 8, 2026, 08_59_02 PM.png";
import { getTravelDocumentsSettingsHref } from "@/features/documents/constants";
import {
  TRAVEL_WALLET_VISUAL_FILTERS,
  filterDocumentsByVisualFilter,
  formatDocumentCountHebrew,
  formatLinkedCountHebrew,
  type TravelWalletVisualFilter,
} from "@/features/documents/document-filter-ui";
import type { TravelDocumentViewModel } from "@/features/documents/types";
import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";
import styles from "./DocumentsPage.module.scss";

type DocumentsPageContentProps = {
  tripId: string;
  documents: TravelDocumentViewModel[];
  isOwner: boolean;
};

function FilterIcon({
  icon,
  className,
}: {
  icon: (typeof TRAVEL_WALLET_VISUAL_FILTERS)[number]["icon"];
  className?: string;
}) {
  switch (icon) {
    case "grid":
      return <IconGrid className={className} />;
    case "plane":
      return <IconPlane className={className} />;
    case "bed":
      return <IconAccommodation className={className} />;
    case "train":
      return <IconTrain className={className} />;
    case "ticket":
      return <IconTicket className={className} />;
    case "shield":
      return <IconShield className={className} />;
    case "more":
      return <IconMore className={className} />;
    default:
      return <IconGrid className={className} />;
  }
}

function isMostlyLatin(text: string): boolean {
  return /^[\x00-\x7F\s()[\]_.-]+$/.test(text.trim());
}

function DocumentFileVisual({ document }: { document: TravelDocumentViewModel }) {
  if (document.isPdf) {
    return (
      <div className={styles.fileVisual}>
        <IconFilePdf className={styles.fileIcon} aria-hidden />
        <span className={styles.fileLabel}>PDF</span>
      </div>
    );
  }

  if (document.isImage) {
    return (
      <div className={styles.fileVisual}>
        <IconFileImage className={styles.fileIcon} aria-hidden />
        <span className={styles.fileLabel}>{document.fileTypeLabel}</span>
      </div>
    );
  }

  return (
    <div className={styles.fileVisual}>
      <IconDocuments className={styles.fileIcon} aria-hidden />
      <span className={styles.fileLabel}>{document.fileTypeLabel}</span>
    </div>
  );
}

function DocumentContext({ document }: { document: TravelDocumentViewModel }) {
  if (!document.contextLink) {
    return null;
  }

  if (document.contextLink.type === "activity") {
    return (
      <div className={styles.contextBlock}>
        <IconActivityAttraction className={styles.contextIcon} aria-hidden />
        <div className={styles.contextText}>
          <p className={styles.contextPrimary} dir="auto">
            {document.contextLink.title}
          </p>
          <p className={styles.contextSecondary}>
            {formatCalendarDateDisplay(document.contextLink.date)} ·{" "}
            {document.contextLink.activityType}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contextBlock}>
      <IconAccommodation className={styles.contextIcon} aria-hidden />
      <div className={styles.contextText}>
        <p className={styles.contextPrimary} dir="auto">
          {document.contextLink.title}
        </p>
        {document.contextLink.subtitle ? (
          <p className={styles.contextSecondary} dir="auto">
            {document.contextLink.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function DocumentsPageContent({
  tripId,
  documents,
  isOwner,
}: DocumentsPageContentProps) {
  const [activeFilter, setActiveFilter] = useState<TravelWalletVisualFilter>("all");

  const filteredDocuments = useMemo(
    () => filterDocumentsByVisualFilter(documents, activeFilter),
    [activeFilter, documents],
  );

  const linkedCount = useMemo(
    () => documents.filter((document) => Boolean(document.contextLink)).length,
    [documents],
  );

  return (
    <AppPage width="wide">
      <div className={styles.documentsCanvas}>
        <div className={styles.bottomDecoration} aria-hidden>
          <Image
            src={walletBottomArtwork}
            alt=""
            fill
            className={styles.bottomDecorationImage}
            sizes="(max-width: 768px) 100vw, 72rem"
          />
        </div>

        <div className={styles.walletPage}>
        <section className={styles.hero} aria-labelledby="wallet-hero-title">
          <Image
            src={japanWalletHero}
            alt=""
            fill
            priority
            className={styles.heroArtwork}
            sizes="(max-width: 768px) 100vw, 950px"
          />
          <div className={styles.heroReadabilityOverlay} aria-hidden />
          <div className={styles.heroContent}>
            <h1 id="wallet-hero-title" className={styles.heroTitle}>
              ארנק הנסיעה
            </h1>
            <p className={styles.heroSubtitle}>
              כל הכרטיסים, ההזמנות והמסמכים החשובים
              <br />
              במקום אחד — לטיול רגוע יותר.
            </p>
          </div>
        </section>

        <div className={styles.filtersWrap}>
          <div
            className={styles.filters}
            role="tablist"
            aria-label="סינון לפי קטגוריה"
          >
            {TRAVEL_WALLET_VISUAL_FILTERS.map((option) => {
              const isActive = activeFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ""}`}
                  onClick={() => setActiveFilter(option.value)}
                >
                  <FilterIcon icon={option.icon} className={styles.filterIcon} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {documents.length > 0 ? (
          <div className={styles.summaryStrip} aria-label="סיכום ארנק">
            <span className={styles.summaryItem}>
              <IconDocuments className={styles.summaryIcon} aria-hidden />
              {formatDocumentCountHebrew(documents.length)}
            </span>
            {linkedCount > 0 ? (
              <>
                <span className={styles.summaryDivider} aria-hidden />
                <span className={styles.summaryItem}>
                  <IconLink className={styles.summaryIcon} aria-hidden />
                  {formatLinkedCountHebrew(linkedCount)}
                </span>
              </>
            ) : null}
          </div>
        ) : null}

        {filteredDocuments.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              {documents.length === 0 ? "אין מסמכים עדיין" : "אין מסמכים בקטגוריה זו"}
            </p>
            <p className={styles.emptyHint}>
              {documents.length === 0
                ? isOwner
                  ? "הוסיפו כרטיסי טיסה, הזמנות וביטוחים כדי שיהיו זמינים לכל מי שבטיול."
                  : "בעל הטיול עדיין לא הוסיף מסמכים."
                : "נסו לבחור קטגוריה אחרת."}
            </p>
            {documents.length === 0 && isOwner ? (
              <Link href={getTravelDocumentsSettingsHref(tripId)} className={styles.emptyLink}>
                להוספת מסמך בהגדרות
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className={styles.list}>
            {filteredDocuments.map((document) => {
              const titleClass = isMostlyLatin(document.title)
                ? `${styles.cardTitle} ${styles.cardTitleLtr}`
                : styles.cardTitle;

              return (
                <li key={document.id}>
                  <Link href={document.detailHref} className={styles.cardLink}>
                    <article className={styles.documentCard}>
                      <span className={styles.cardAccent} aria-hidden />
                      <span className={styles.cardPerforation} aria-hidden />
                      <DocumentFileVisual document={document} />
                      <div className={styles.cardMain}>
                        <span className={styles.categoryBadge}>
                          {document.categoryLabel}
                        </span>
                        <h2 className={titleClass} dir="auto">
                          {document.title}
                        </h2>
                        <DocumentContext document={document} />
                      </div>
                      <div className={styles.cardAside}>
                        <IconChevron className={styles.cardChevron} aria-hidden />
                        <span className={styles.cardDate}>
                          <IconCalendar className={styles.cardDateIcon} aria-hidden />
                          <span>נוסף ב{document.createdAtLabel}</span>
                        </span>
                      </div>
                    </article>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        </div>
      </div>
    </AppPage>
  );
}
