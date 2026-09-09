import Link from "next/link";
import { AppPage } from "@/features/app-shell/AppPage";
import { Card } from "@/components/ui/Card/Card";
import { CurrentLocationPanel } from "./CurrentLocationPanel.client";
import { CustomResourcesSection } from "./CustomResourcesSection.client";
import { EMERGENCY_MESSAGES } from "./constants";
import { EmergencyResourceActions } from "./EmergencyResourceActions";
import type { EmergencyPageViewModel } from "./types";
import styles from "./EmergencyPage.module.scss";

export function EmergencyPageContent(model: EmergencyPageViewModel) {
  const sourceMeta = model.assistanceResources[0]?.source;

  return (
    <AppPage width="content">
      <div className={styles.page}>
        <section className={styles.section} aria-labelledby="urgent-heading">
          <h2 id="urgent-heading" className={styles.sectionTitle}>
            {EMERGENCY_MESSAGES.urgentSection}
          </h2>
          <ul className={styles.urgentList}>
            {model.urgentResources.map((resource) => (
              <li key={resource.id} className={styles.urgentItem}>
                <p className={styles.urgentTitle}>{resource.title}</p>
                {resource.description ? (
                  <p className={styles.urgentDescription}>{resource.description}</p>
                ) : null}
                <EmergencyResourceActions actions={resource.actions} primary />
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="assistance-heading">
          <h2 id="assistance-heading" className={styles.sectionTitle}>
            {EMERGENCY_MESSAGES.assistanceSection}
          </h2>
          <ul className={styles.resourceList}>
            {model.assistanceResources.map((resource) => (
              <li key={resource.id} className={styles.resourceItem}>
                <p className={styles.resourceTitle}>{resource.title}</p>
                {resource.description ? (
                  <p className={styles.resourceMeta}>{resource.description}</p>
                ) : null}
                {resource.availability ? (
                  <p className={styles.resourceMeta}>{resource.availability}</p>
                ) : null}
                <EmergencyResourceActions actions={resource.actions} />
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="location-heading">
          <h2 id="location-heading" className={styles.sectionTitle}>
            {EMERGENCY_MESSAGES.myLocation}
          </h2>
          <CurrentLocationPanel />
        </section>

        {model.currentAccommodation ? (
          <section className={styles.section} aria-labelledby="accommodation-heading">
            <h2 id="accommodation-heading" className={styles.sectionTitle}>
              {EMERGENCY_MESSAGES.currentAccommodation}
            </h2>
            <Card variant="standard">
              <p className={styles.resourceTitle} dir="auto">
                {model.currentAccommodation.name}
              </p>
              {model.currentAccommodation.city ? (
                <p className={styles.resourceMeta} dir="auto">
                  {model.currentAccommodation.city}
                </p>
              ) : null}
              {model.currentAccommodation.address ? (
                <p className={styles.resourceMeta} dir="auto">
                  {model.currentAccommodation.address}
                </p>
              ) : null}
              <div className={styles.actions}>
                <Link href={model.currentAccommodation.detailHref} className={styles.actionButton}>
                  פרטי לינה
                </Link>
                <Link href={model.currentAccommodation.taxiHref} className={styles.actionButton}>
                  Taxi Mode
                </Link>
                {model.currentAccommodation.mapsHref ? (
                  <a
                    href={model.currentAccommodation.mapsHref}
                    className={styles.actionButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    פתיחה במפה
                  </a>
                ) : null}
              </div>
            </Card>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="documents-heading">
          <h2 id="documents-heading" className={styles.sectionTitle}>
            {EMERGENCY_MESSAGES.emergencyDocuments}
          </h2>
          {model.documents.length === 0 ? (
            <p className={styles.empty}>{EMERGENCY_MESSAGES.noDocuments}</p>
          ) : (
            <ul className={styles.linkList}>
              {model.documents.map((document) => (
                <li key={document.id} className={styles.linkItem}>
                  <Link href={document.detailHref} className={styles.linkAnchor}>
                    <span className={styles.resourceTitle} dir="auto">
                      {document.title}
                    </span>
                    <span className={styles.resourceMeta}>{document.categoryLabel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <CustomResourcesSection tripId={model.tripId} resources={model.customResources} />

        <section className={styles.section} aria-labelledby="phrases-heading">
          <h2 id="phrases-heading" className={styles.sectionTitle}>
            {EMERGENCY_MESSAGES.emergencyPhrases}
          </h2>
          <ul className={styles.linkList}>
            {model.phraseLinks.map((phrase) => (
              <li key={phrase.id} className={styles.linkItem}>
                <Link href={phrase.detailHref} className={styles.linkAnchor}>
                  {phrase.sourceText}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={model.allEmergencyPhrasesHref} className={styles.actionButton}>
            {EMERGENCY_MESSAGES.allEmergencyPhrases}
          </Link>
        </section>

        {sourceMeta ? (
          <p className={styles.footerNote}>
            {EMERGENCY_MESSAGES.sourceNote} ({sourceMeta.verifiedAt})
          </p>
        ) : null}
      </div>
    </AppPage>
  );
}
