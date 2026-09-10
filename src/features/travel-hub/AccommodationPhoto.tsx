"use client";

import { IconAccommodation } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import styles from "./TravelHub.module.scss";

type AccommodationPhotoProps = {
  placePhoto?: PlacePhotoPresentation;
  showGoogleAttribution?: boolean;
};

export function AccommodationPhoto({
  placePhoto,
  showGoogleAttribution = false,
}: AccommodationPhotoProps) {
  return (
    <PlaceImage
      photoHref={placePhoto?.photoHref}
      authorAttributions={placePhoto?.authorAttributions ?? []}
      showPoweredByGoogle={showGoogleAttribution}
      fallbackIcon={IconAccommodation}
      frameClassName={styles.accommodationPhotoFrame}
      imageClassName={styles.accommodationPhoto}
      fallbackClassName={styles.accommodationPhotoFallback}
      attributionClassName={styles.accommodationAttribution}
    />
  );
}
