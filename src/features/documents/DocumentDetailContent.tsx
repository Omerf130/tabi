import Link from "next/link";
import {
  IconAccommodation,
  IconActivityAttraction,
  IconFileImage,
  IconFilePdf,
  IconDocuments,
} from "@/components/ui/icons";
import { AppPage } from "@/features/app-shell/AppPage";
import type { TravelDocumentViewModel } from "@/features/documents/types";
import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";
import styles from "./DocumentDetail.module.scss";

type DocumentDetailContentProps = {
  document: TravelDocumentViewModel;
};

function isMostlyLatin(text: string): boolean {
  return /^[\x00-\x7F\s()[\]_.-]+$/.test(text.trim());
}

function FileIdentity({ document }: { document: TravelDocumentViewModel }) {
  if (document.isPdf) {
    return (
      <div className={styles.fileIdentity}>
        <IconFilePdf className={styles.fileIcon} aria-hidden />
        <span className={styles.fileLabel}>PDF</span>
      </div>
    );
  }

  if (document.isImage) {
    return (
      <div className={styles.fileIdentity}>
        <IconFileImage className={styles.fileIcon} aria-hidden />
        <span className={styles.fileLabel}>{document.fileTypeLabel}</span>
      </div>
    );
  }

  return (
    <div className={styles.fileIdentity}>
      <IconDocuments className={styles.fileIcon} aria-hidden />
      <span className={styles.fileLabel}>{document.fileTypeLabel}</span>
    </div>
  );
}

function ContextSection({ document }: { document: TravelDocumentViewModel }) {
  if (!document.contextLink) {
    return null;
  }

  if (document.contextLink.type === "activity") {
    return (
      <section className={styles.contextCard} aria-label="קשר לפעילות">
        <IconActivityAttraction className={styles.contextIcon} aria-hidden />
        <div>
          <p className={styles.contextPrimary} dir="auto">
            {document.contextLink.title}
          </p>
          <p className={styles.contextSecondary}>
            {formatCalendarDateDisplay(document.contextLink.date)} ·{" "}
            {document.contextLink.activityType}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.contextCard} aria-label="קשר ללינה">
      <IconAccommodation className={styles.contextIcon} aria-hidden />
      <div>
        <p className={styles.contextPrimary} dir="auto">
          {document.contextLink.title}
        </p>
        {document.contextLink.subtitle ? (
          <p className={styles.contextSecondary} dir="auto">
            {document.contextLink.subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function DocumentDetailContent({ document }: DocumentDetailContentProps) {
  const titleClass = isMostlyLatin(document.title)
    ? `${styles.documentTitle} ${styles.titleLtr}`
    : styles.documentTitle;

  return (
    <AppPage width="wide">
      <div className={styles.walletDetail}>
        <div className={styles.identityStrip}>
          <span>ארנק הנסיעה</span>
          <span className={styles.identityDot} aria-hidden />
          <span>מסמך</span>
        </div>

        <header className={styles.heroCard}>
          <span className={styles.categoryBadge}>{document.categoryLabel}</span>
          <h1 className={titleClass} dir="auto">
            {document.title}
          </h1>
          <FileIdentity document={document} />
        </header>

        {document.description ? (
          <dl className={styles.detailsList}>
            <div className={styles.detailItem}>
              <dt>תיאור</dt>
              <dd dir="auto">{document.description}</dd>
            </div>
          </dl>
        ) : null}

        <ContextSection document={document} />

        {document.isImage ? (
          <div className={styles.previewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={document.fileHref}
              alt=""
              className={styles.previewImage}
            />
          </div>
        ) : document.isPdf ? (
          <div className={styles.previewWrap}>
            <p className={styles.pdfHint}>
              לצפייה ב-PDF השתמשו בכפתור &quot;פתיחה&quot; — הדפדפן יציג את המסמך בצורה מאובטחת.
            </p>
          </div>
        ) : null}

        <div className={styles.actions}>
          <Link
            href={document.fileHref}
            className={styles.actionLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {document.isPdf ? "פתיחה" : "צפייה"}
          </Link>
          <Link
            href={document.downloadHref}
            className={`${styles.actionLink} ${styles.actionLinkSecondary}`}
          >
            הורדה
          </Link>
        </div>
      </div>
    </AppPage>
  );
}
