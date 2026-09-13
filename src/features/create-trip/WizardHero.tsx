import Image from "next/image";
import Link from "next/link";
import { TabiBrandMark } from "@/features/welcome/TabiBrandMark";
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
            aria-label="Go back"
          >
            ‹
          </button>
        ) : (
          <Link href="/app" className={styles.heroBackButton} aria-label="Back to My Trips">
            ‹
          </Link>
        )}

        <div className={styles.heroBrand}>
          <TabiBrandMark className={styles.heroMark} />
        </div>

        <span className={styles.heroTopSpacer} aria-hidden="true" />
      </div>

      <WizardStepper currentStep={step} />
    </header>
  );
}
