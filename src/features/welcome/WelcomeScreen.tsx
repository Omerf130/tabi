import Image from "next/image";
import Link from "next/link";
import { TabiBrandMark } from "./TabiBrandMark";
import styles from "./WelcomeScreen.module.scss";

export function WelcomeScreen() {
  return (
    <section
      className={styles.screen}
      aria-labelledby="welcome-brand"
      dir="ltr"
      lang="en"
    >
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropBlur} />
        <Image
          src="/destination-visuals/homeApp.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <header className={styles.brandBlock}>
          <TabiBrandMark />
          <h1 id="welcome-brand" className={styles.brandName}>
            Tabi
          </h1>
          <p className={styles.tagline}>
            Your journey.
            <br />
            Perfectly planned.
          </p>
        </header>

        <div className={styles.actions}>
          <Link href="/register" className={styles.primaryCta}>
            Get Started
          </Link>
          <p className={styles.signIn}>
            Already have an account?{" "}
            <Link href="/login" className={styles.signInLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
