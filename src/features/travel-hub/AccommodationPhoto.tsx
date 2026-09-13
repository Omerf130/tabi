"use client";

import { IconAccommodation } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import styles from "./TravelHub.module.scss";

type AccommodationPhotoProps = {
  placePhoto?: PlacePhotoPresentation;
  showGoogleAttribution?: boolean;
  alt: string;
  hideAttribution?: boolean;
};

export function AccommodationPhoto({
  placePhoto,
  showGoogleAttribution = false,
  alt,
  hideAttribution = false,
}: AccommodationPhotoProps) {
  return (
    <PlaceImage
      photoHref={placePhoto?.photoHref}
      authorAttributions={placePhoto?.authorAttributions ?? []}
      showPoweredByGoogle={showGoogleAttribution}
      hideAttribution={hideAttribution}
      presentation="compact"
      fallbackIcon={IconAccommodation}
      frameClassName={styles.accommodationPhotoFrame}
      imageClassName={styles.accommodationPhoto}
      fallbackClassName={styles.accommodationPhotoFallback}
      alt={alt}
    />
  );
}

