import Link from "next/link";
import {
  IconAccommodation,
  IconCurrency,
  IconDictionary,
  IconGrid,
  IconSettings,
  IconShield,
  IconTrain,
  IconWeather,
} from "@/components/ui/icons";
import { AppPage } from "@/features/app-shell/AppPage";
import { ListProgressBar } from "@/features/lists/ListProgressBar";
import { GooglePlacesAttribution } from "@/features/places/GooglePlacesAttribution";
import { AccommodationPhoto } from "./AccommodationPhoto";
import type { TravelHubViewModel, TravelToolViewModel } from "./types";
import styles from "./TravelHub.module.scss";

type TravelHubContentProps = {
  model: TravelHubViewModel;
};

function TravelToolIcon({ tool }: { tool: TravelToolViewModel }) {
  switch (tool.id) {
    case "accommodations":
      return <IconAccommodation className={styles.toolIconSvg} />;
    case "lists":
      return <IconGrid className={styles.toolIconSvg} />;
    case "currency":
      return <IconCurrency className={styles.toolIconSvg} />;
    case "transport":
      return <IconTrain className={styles.toolIconSvg} />;
    case "language":
      return <IconDictionary className={styles.toolIconSvg} />;
    case "weather":
      return <IconWeather className={styles.toolIconSvg} />;
    case "emergency":
      return <IconShield className={styles.toolIconSvg} />;
    default:
      return <IconGrid className={styles.toolIconSvg} />;
  }
}

function TravelToolCard({ tool }: { tool: TravelToolViewModel }) {
  const iconContainerClass = [
    styles.toolIconWrap,
    styles[tool.colorClass as keyof typeof styles],
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className={iconContainerClass}>
        <TravelToolIcon tool={tool} />
      </div>
      <span className={styles.toolLabel}>{tool.label}</span>
      {tool.status === "coming_soon" ? (
        <span className={styles.comingSoonBadge}>בקרוב</span>
      ) : null}
    </>
  );

  if (tool.status === "active" && tool.href) {
    return (
      <Link href={tool.href} className={styles.toolCard}>
        {content}
      </Link>
    );
  }

  return (
    <div className={[styles.toolCard, styles.toolCardDisabled].join(" ")} aria-disabled="true">
      {content}
    </div>
  );
}

export function TravelHubContent({ model }: TravelHubContentProps) {
  const { contextualAccommodation, attentionList } = model;

  return (
    <AppPage width="content">
      <div className={styles.hub}>
        <section className={styles.hero} aria-label="מרכז הטיול">
          <div className={styles.heroVisual} aria-hidden />
          <div className={styles.heroBody}>
            <p className={styles.heroEyebrow}>עוד</p>
            <h2 className={styles.heroTitle}>מרכז הטיול שלך ביפן</h2>
            <p className={styles.heroSubtitle}>כלים, לינה ומשימות — במקום אחד</p>
          </div>
        </section>

        {contextualAccommodation ? (
          <section
            className={styles.section}
            aria-labelledby="contextual-accommodation-title"
          >
            <h3 id="contextual-accommodation-title" className={styles.sectionTitle}>
              {contextualAccommodation.title}
            </h3>
            <article className={styles.accommodationCard}>
              <div className={styles.accommodationTop}>
                <AccommodationPhoto photoHref={contextualAccommodation.photoHref} />
                <div className={styles.accommodationIdentity}>
                  <h4 className={styles.accommodationName} dir="auto">
                    {contextualAccommodation.accommodation.name}
                  </h4>
                  <p className={styles.accommodationLocation}>
                    {contextualAccommodation.accommodation.city}, Japan
                  </p>
                  {contextualAccommodation.showGoogleAttribution ? (
                    <GooglePlacesAttribution className={styles.accommodationAttribution} />
                  ) : null}
                </div>
              </div>
              <div className={styles.accommodationDivider} aria-hidden />
              <div className={styles.accommodationActions}>
                {contextualAccommodation.mapsHref ? (
                  <a
                    href={contextualAccommodation.mapsHref}
                    className={styles.actionButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    מפה
                  </a>
                ) : null}
                <Link
                  href={contextualAccommodation.taxiHref}
                  className={styles.actionButton}
                >
                  הצג לנהג
                </Link>
                <Link
                  href={contextualAccommodation.detailHref}
                  className={styles.actionButton}
                >
                  פרטים
                </Link>
              </div>
            </article>
          </section>
        ) : null}

        {attentionList ? (
          <section className={styles.section} aria-labelledby="attention-list-title">
            <h3 id="attention-list-title" className={styles.sectionTitle}>
              {attentionList.sectionLabel}
            </h3>
            <Link href={attentionList.href} className={styles.attentionCardLink}>
              <article className={styles.attentionCard}>
                <p className={styles.attentionMessage}>{attentionList.attentionMessage}</p>
                <ListProgressBar
                  progress={attentionList.list.progress}
                  label={attentionList.list.progressLabel}
                  title={attentionList.list.title}
                />
              </article>
            </Link>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="travel-tools-title">
          <h3 id="travel-tools-title" className={styles.sectionTitle}>
            כלי הטיול
          </h3>
          <div className={styles.toolsGrid}>
            {model.tools.map((tool) => (
              <TravelToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        <section className={styles.managementSection} aria-labelledby="management-entry-title">
          <Link href={model.manageHref} className={styles.managementEntry}>
            <IconSettings className={styles.managementIcon} aria-hidden />
            <span id="management-entry-title">הגדרות וניהול</span>
          </Link>
        </section>
      </div>
    </AppPage>
  );
}
