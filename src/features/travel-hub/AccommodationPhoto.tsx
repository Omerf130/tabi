"use client";

import { IconAccommodation } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import styles from "./TravelHub.module.scss";

type AccommodationPhotoProps = {
  placePhoto?: PlacePhotoPresentation;
  showGoogleAttribution?: boolean;
  alt: string;
};

export function AccommodationPhoto({
  placePhoto,
  showGoogleAttribution = false,
  alt,
}: AccommodationPhotoProps) {
  return (
    <PlaceImage
      photoHref={placePhoto?.photoHref}
      authorAttributions={placePhoto?.authorAttributions ?? []}
      showPoweredByGoogle={showGoogleAttribution}
      presentation="compact"
      fallbackIcon={IconAccommodation}
      frameClassName={styles.accommodationPhotoFrame}
      imageClassName={styles.accommodationPhoto}
      fallbackClassName={styles.accommodationPhotoFallback}
      alt={alt}
    />
  );
}
