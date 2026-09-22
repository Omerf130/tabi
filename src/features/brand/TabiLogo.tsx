import Image from "next/image";
import {
  TABI_LOGO_ASPECT_RATIO,
  TABI_LOGO_HEIGHT,
  TABI_LOGO_SRC,
  TABI_LOGO_WIDTH,
} from "./tabi-logo.constants";
import styles from "./TabiLogo.module.scss";

export type TabiLogoVariant = "hero" | "auth" | "compact";

export type TabiLogoTone = "default" | "light";

export type TabiLogoProps = {
  variant?: TabiLogoVariant;
  className?: string;
  /**
   * `light` renders the dark monochrome artwork as white (CSS filter) for
   * dark, photographic, or colorful backgrounds. Transparent areas stay clear.
   */
  tone?: TabiLogoTone;
  /** When true, the image is decorative and hidden from assistive tech. */
  decorative?: boolean;
  priority?: boolean;
};

export function TabiLogo({
  variant = "compact",
  className,
  tone = "default",
  decorative = false,
  priority = false,
}: TabiLogoProps) {
  const rootClass = [
    styles.logo,
    styles[variant],
    tone === "light" ? styles.toneLight : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={rootClass}
      style={{ ["--tabi-logo-aspect-ratio" as string]: TABI_LOGO_ASPECT_RATIO }}
    >
      <Image
        src={TABI_LOGO_SRC}
        alt={decorative ? "" : "Tabi"}
        width={TABI_LOGO_WIDTH}
        height={TABI_LOGO_HEIGHT}
        priority={priority}
        className={styles.image}
        sizes={
          variant === "hero"
            ? "(max-width: 768px) 52vw, 17.5rem"
            : variant === "auth"
              ? "(max-width: 768px) 38vw, 10rem"
              : "(max-width: 768px) 22vw, 5.25rem"
        }
      />
    </span>
  );
}
