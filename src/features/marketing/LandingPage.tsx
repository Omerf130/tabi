import { MarketingFooter } from "./MarketingFooter";
import { MarketingHeaderClient } from "./MarketingHeader.client";
import { BeforeDuringSection } from "./sections/BeforeDuringSection";
import { ChaosSection } from "./sections/ChaosSection";
import { CollaborationSection } from "./sections/CollaborationSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { PocketSection } from "./sections/PocketSection";
import styles from "./landing.module.scss";

export function LandingPage() {
  return (
    <div className={styles.landing}>
      <MarketingHeaderClient />
      <main id="main-content">
        <HeroSection />
        <ChaosSection />
        <PocketSection />
        <BeforeDuringSection />
        <CollaborationSection />
        <HowItWorksSection />
        <FinalCtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
