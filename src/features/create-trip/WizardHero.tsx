"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { TabiLogo } from "@/features/brand/TabiLogo";
import { CREATE_TRIP_HERO_VISUAL } from "./create-trip-visual";
import { WizardStepper } from "./WizardStepper";
import type { CreateTripWizardStep } from "./wizard-state";
import styles from "./CreateTripWizard.module.scss";

type WizardHeroProps = {
  step: CreateTripWizardStep;
  canGoBack: boolean;
  onBack: () => void;
};

export function WizardHero({ step, canGoBack, onBack }: WizardHeroProps) {
  const t = useTranslations("CreateTrip.hero");
  const tCreateTrip = useTranslations("CreateTrip");

  return (
    <header className={styles.hero}>
      <div className={styles.heroMedia} aria-hidden="true">
        <div className={styles.heroImageFrame}>
          <Image
            src={CREATE_TRIP_HERO_VISUAL}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
        </div>
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroTopRow}>
        {canGoBack ? (
          <button
            type="button"
            className={styles.heroBackButton}
            onClick={onBack}
            aria-label={t("goBack")}
          >
            ‹
          </button>
        ) : (
          <Link href="/app" className={styles.heroBackButton} aria-label={t("backToMyTrips")}>
            ‹
          </Link>
        )}

        <div className={styles.heroBrand} aria-label={tCreateTrip("brandName")}>
          <TabiLogo variant="compact" tone="light" decorative />
        </div>

        <span className={styles.heroTopSpacer} aria-hidden="true" />
      </div>

      <WizardStepper currentStep={step} />
    </header>
  );
}
