import { GooglePlacesAttribution } from "@/features/places/GooglePlacesAttribution";
import type { PlaceImagePresentationMode } from "./place-image-presentation";
import type { PlacePhotoAuthorAttribution } from "./types";
import styles from "./PlaceImage.module.scss";

type PlaceImageAttributionProps = {
  authorAttributions: readonly PlacePhotoAuthorAttribution[];
  showPoweredByGoogle?: boolean;
  presentation?: PlaceImagePresentationMode;
  className?: string;
};

export function PlaceImageAttribution({
  authorAttributions,
  showPoweredByGoogle = false,
  presentation = "default",
  className,
}: PlaceImageAttributionProps) {
  const hasAuthorAttribution = authorAttributions.length > 0;

  if (!hasAuthorAttribution && !showPoweredByGoogle) {
    return null;
  }

  const isCompact = presentation === "compact";

  return (
    <div
      className={[
        styles.attributionWrap,
        isCompact ? styles.attributionWrapCompact : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasAuthorAttribution ? (
        <ul className={styles.authorAttributions}>
          {authorAttributions.map((attribution) => (
            <li key={`${attribution.displayName ?? "author"}-${attribution.uri ?? attribution.photoUri ?? "none"}`}>
              {attribution.uri ? (
                <a
                  href={attribution.uri.startsWith("//") ? `https:${attribution.uri}` : attribution.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attribution.displayName ?? "Photo contributor"}
                </a>
              ) : (
                <span>{attribution.displayName ?? "Photo contributor"}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {showPoweredByGoogle ? (
        <GooglePlacesAttribution className={styles.poweredByGoogle} />
      ) : null}
    </div>
  );
}
