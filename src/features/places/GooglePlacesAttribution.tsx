import { GOOGLE_ATTRIBUTION } from "./constants";
import styles from "./placeSearch.module.scss";

export function GooglePlacesAttribution({ className }: { className?: string }) {
  return (
    <p className={[styles.attribution, className].filter(Boolean).join(" ")}>
      {GOOGLE_ATTRIBUTION.poweredByText}
    </p>
  );
}
