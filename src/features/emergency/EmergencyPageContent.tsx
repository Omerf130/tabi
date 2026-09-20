import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/features/auth/session";
import { AppPage } from "@/features/app-shell/AppPage";
import { Card } from "@/components/ui/Card/Card";
import { CurrentLocationPanel } from "./CurrentLocationPanel.client";
import { CustomResourcesSection } from "./CustomResourcesSection.client";
import { EmergencyResourceActions } from "./EmergencyResourceActions";
import type { EmergencyPageViewModel } from "./types";
import type { EmergencyServiceCategory } from "./data/emergency-dataset-schema";
import styles from "./EmergencyPage.module.scss";

function serviceCategoryMessageKey(
  category: EmergencyServiceCategory,
): `services.${EmergencyServiceCategory}` {
  return `services.${category}`;
}

export async function EmergencyPageContent(model: EmergencyPageViewModel) {
  const [t, user] = await Promise.all([
    getTranslations("Emergency"),
    requireUser(),
  ]);

  return (
    <AppPage width="content">
      <div className={styles.page}>
        {model.verified.status === "ready" ? (
          <section className={styles.section} aria-labelledby="verified-heading">
            <h2 id="verified-heading" className={styles.sectionTitle}>
              {t("verifiedSectionTitle")}
            </h2>
            <ul className={styles.urgentList}>
              {model.verified.services.map((service) => (
                <li key={service.id} className={styles.urgentItem}>
                  <p className={styles.urgentTitle}>
                    {t(serviceCategoryMessageKey(service.category))}
                  </p>
                  <EmergencyResourceActions actions={service.actions} primary />
                </li>
              ))}
            </ul>
            <p className={styles.sourceNote}>
              {t("sourceNote", {
                revision: model.verified.source.sourceRevision,
                imported: model.verified.source.datasetImportedAt,
              })}
            </p>
          </section>
        ) : null}

        {model.verified.status === "missing_destination" ? (
          <section className={styles.section} aria-live="polite">
            <p className={styles.notice}>{t("missingDestinationNotice")}</p>
            <Link href={model.tripDetailsHref} className={styles.actionButton}>
              {t("updateTripDestination")}
            </Link>
          </section>
        ) : null}

        {model.verified.status === "unsupported_country" ? (
          <section className={styles.section} aria-live="polite">
            <p className={styles.notice}>{t("unsupportedCountryNotice")}</p>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="location-heading">
          <h2 id="location-heading" className={styles.sectionTitle}>
            {t("myLocation")}
          </h2>
          <CurrentLocationPanel storedPreferredMapsApp={user.preferredMapsApp} />
        </section>

        {model.currentAccommodation ? (
          <section className={styles.section} aria-labelledby="accommodation-heading">
            <h2 id="accommodation-heading" className={styles.sectionTitle}>
              {t("currentAccommodation")}
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
                  {t("accommodationDetails")}
                </Link>
                <Link href={model.currentAccommodation.taxiHref} className={styles.actionButton}>
                  {t("taxiMode")}
                </Link>
                {model.currentAccommodation.mapsHref ? (
                  <a
                    href={model.currentAccommodation.mapsHref}
                    className={styles.actionButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("openInMap")}
                  </a>
                ) : null}
              </div>
            </Card>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="documents-heading">
          <h2 id="documents-heading" className={styles.sectionTitle}>
            {t("emergencyDocuments")}
          </h2>
          {model.documents.length === 0 ? (
            <p className={styles.empty}>{t("errors.noDocuments")}</p>
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
            {t("emergencyPhrases")}
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
            {t("allEmergencyPhrases")}
          </Link>
        </section>
      </div>
    </AppPage>
  );
}
