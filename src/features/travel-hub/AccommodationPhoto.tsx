"use client";

import { useState } from "react";
import { IconAccommodation } from "@/components/ui/icons";
import styles from "./TravelHub.module.scss";

type AccommodationPhotoProps = {
  photoHref?: string;
};

export function AccommodationPhoto({ photoHref }: AccommodationPhotoProps) {
  const [hasError, setHasError] = useState(false);
  const showPhoto = Boolean(photoHref) && !hasError;

  return (
    <div className={styles.accommodationPhotoFrame}>
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoHref}
          alt=""
          className={styles.accommodationPhoto}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={styles.accommodationPhotoFallback} aria-hidden>
          <IconAccommodation className={styles.accommodationPhotoIcon} />
        </div>
      )}
    </div>
  );
}
