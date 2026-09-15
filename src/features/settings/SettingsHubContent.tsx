import { getLocale, getTranslations } from "next-intl/server";
import { resolveAppLocale } from "@/features/i18n/locale";
import { AppPage } from "@/features/app-shell/AppPage";
import { getOrCreateTripFinanceSettings } from "@/features/finance/finance-settings-domain";
import { requireTripMember } from "@/features/trips/authorization";
import { buildSettingsHubViewModel } from "./build-settings-hub-view-model";
import { SettingsHubRow } from "./SettingsHubRow";
import styles from "./SettingsHub.module.scss";

type SettingsHubContentProps = {
  tripId: string;
};

export async function SettingsHubContent({ tripId }: SettingsHubContentProps) {
  const [trip, t, financeSettings, localeRaw] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Settings"),
    getOrCreateTripFinanceSettings(tripId),
    getLocale(),
  ]);

  const model = buildSettingsHubViewModel({
    trip,
    isOwner: trip.role === "owner",
    baseCurrency: financeSettings.baseCurrency,
    locale: resolveAppLocale(localeRaw),
    t,
  });

  const comingSoonLabel = t("comingSoon");

  return (
    <AppPage width="wide">
      <div className={styles.hub}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{t("title")}</h1>
          <div className={styles.tripContext}>
            <p className={styles.tripName} dir="auto">
              {model.tripName}
            </p>
            {model.destinationLabel ? (
              <p className={styles.tripMeta} dir="auto">
                {model.destinationLabel}
              </p>
            ) : null}
            <p className={styles.tripMeta}>{model.dateRangeLabel}</p>
          </div>
        </header>

        <div className={styles.sectionsGrid}>
          {model.sections.map((section) => (
            <section
              key={section.id}
              className={styles.section}
              aria-labelledby={`settings-section-${section.id}`}
            >
              <h2 id={`settings-section-${section.id}`} className={styles.sectionTitle}>
                {section.title}
              </h2>
              <div className={styles.sectionRows} role="list">
                {section.rows.map((row) => (
                  <SettingsHubRow
                    key={row.id}
                    row={row}
                    comingSoonLabel={comingSoonLabel}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppPage>
  );
}
