"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import { PlaceImageAttribution } from "./PlaceImageAttribution";
import type { PlaceImagePresentationMode } from "./place-image-presentation";
import type { PlacePhotoAuthorAttribution } from "./types";
import styles from "./PlaceImage.module.scss";

type PlaceImageProps = {
  photoHref?: string;
  authorAttributions?: readonly PlacePhotoAuthorAttribution[];
  showPoweredByGoogle?: boolean;
  presentation?: PlaceImagePresentationMode;
  fallbackIcon: ComponentType<{ className?: string }>;
  frameClassName?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  attributionClassName?: string;
  alt?: string;
};

export function PlaceImage({
  photoHref,
  authorAttributions = [],
  showPoweredByGoogle = false,
  presentation = "default",
  fallbackIcon: FallbackIcon,
  frameClassName,
  imageClassName,
  fallbackClassName,
  attributionClassName,
  alt = "",
}: PlaceImageProps) {
  const [hasError, setHasError] = useState(false);
  const showPhoto = Boolean(photoHref) && !hasError;
  const isCompact = presentation === "compact";

  return (
    <div
      className={[styles.root, isCompact ? styles.rootCompact : null]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={[styles.frame, frameClassName].filter(Boolean).join(" ")}>
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoHref}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={[styles.image, imageClassName].filter(Boolean).join(" ")}
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            className={[styles.fallback, fallbackClassName].filter(Boolean).join(" ")}
            aria-hidden
          >
            <FallbackIcon className={styles.fallbackIcon} />
          </div>
        )}
      </div>
      <PlaceImageAttribution
        authorAttributions={authorAttributions}
        showPoweredByGoogle={showPoweredByGoogle}
        presentation={presentation}
        className={attributionClassName}
      />
    </div>
  );
}
