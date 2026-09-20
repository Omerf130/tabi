"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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
  IconMapPin,
  IconMore,
  IconPlane,
  IconSearch,
  IconShield,
  IconTicket,
  IconTrain,
} from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppPage } from "@/features/app-shell/AppPage";
import { getTravelDocumentsSettingsHref } from "@/features/documents/constants";
import {
  createTravelWalletVisualFilterOptions,
  formatDocumentLinkedCount,
  formatDocumentWalletCount,
} from "@/features/documents/document-labels";
import {
  filterDocumentsByVisualFilter,
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

type VisualFilterIcon =
  | "grid"
  | "plane"
  | "bed"
  | "train"
  | "ticket"
  | "shield"
  | "more";

function FilterIcon({
  icon,
  className,
}: {
  icon: VisualFilterIcon;
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
  const t = useTranslations("Documents");
  const [activeFilter, setActiveFilter] = useState<TravelWalletVisualFilter>("all");
  const visualFilters = useMemo(() => createTravelWalletVisualFilterOptions(t), [t]);

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
        <div className={styles.bottomDecoration} aria-hidden />

        <div className={styles.walletPage}>
        <section className={styles.hero} aria-labelledby="wallet-hero-title">
          <div className={styles.heroBackdrop} aria-hidden />
          <div className={styles.heroReadabilityOverlay} aria-hidden />
          <div className={styles.heroContent}>
            <h1 id="wallet-hero-title" className={styles.heroTitle}>
              {t("pageTitle")}
            </h1>
            <p className={styles.heroSubtitle}>
              {t("pageSubtitleLine1")}
              <br />
              {t("pageSubtitleLine2")}
            </p>
          </div>
        </section>

        <div className={styles.filtersWrap}>
          <div
            className={styles.filters}
            role="tablist"
            aria-label={t("filterAria")}
          >
            {visualFilters.map((option) => {
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
          <div className={styles.summaryStrip} aria-label={t("summaryAria")}>
            <span className={styles.summaryItem}>
              <IconDocuments className={styles.summaryIcon} aria-hidden />
              {formatDocumentWalletCount(documents.length, t)}
            </span>
            {linkedCount > 0 ? (
              <>
                <span className={styles.summaryDivider} aria-hidden />
                <span className={styles.summaryItem}>
                  <IconLink className={styles.summaryIcon} aria-hidden />
                  {formatDocumentLinkedCount(linkedCount, t)}
                </span>
              </>
            ) : null}
          </div>
        ) : null}

        {filteredDocuments.length === 0 ? (
          documents.length === 0 ? (
            <EmptyState
              variant="section"
              className={styles.listEmptyState}
              visual={{
                motif: "documents",
                icon: <IconDocuments aria-hidden />,
                accentIcon: <IconMapPin aria-hidden />,
              }}
              title={t("emptyAll")}
              description={isOwner ? t("emptyAllHintOwner") : t("emptyAllHintGuest")}
              primaryAction={
                isOwner
                  ? {
                      label: t("addInSettings"),
                      href: getTravelDocumentsSettingsHref(tripId),
                    }
                  : undefined
              }
            />
          ) : (
            <EmptyState
              variant="search"
              className={styles.listEmptyState}
              visual={{ motif: "search", icon: <IconSearch aria-hidden /> }}
              title={t("emptyFilter")}
              description={t("emptyFilterHint")}
              primaryAction={{
                label: t("emptyFilterShowAll"),
                onClick: () => setActiveFilter("all"),
              }}
            />
          )
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
                          <span>{t("addedOn", { date: document.createdAtLabel })}</span>
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
