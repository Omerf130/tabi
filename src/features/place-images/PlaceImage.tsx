"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import { PlaceImageAttribution } from "./PlaceImageAttribution";
import type { PlacePhotoAuthorAttribution } from "./types";
import styles from "./PlaceImage.module.scss";

type PlaceImageProps = {
  photoHref?: string;
  authorAttributions?: readonly PlacePhotoAuthorAttribution[];
  showPoweredByGoogle?: boolean;
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
  fallbackIcon: FallbackIcon,
  frameClassName,
  imageClassName,
  fallbackClassName,
  attributionClassName,
  alt = "",
}: PlaceImageProps) {
  const [hasError, setHasError] = useState(false);
  const showPhoto = Boolean(photoHref) && !hasError;

  return (
    <div className={styles.root}>
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
        className={attributionClassName}
      />
    </div>
  );
}
