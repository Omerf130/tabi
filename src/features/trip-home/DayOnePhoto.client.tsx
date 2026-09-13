"use client";

import { IconActivityOther } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import styles from "./TripHomeContent.module.scss";

type DayOnePhotoProps = {
  photoPresentation: PlacePhotoPresentation;
};

export function DayOnePhoto({ photoPresentation }: DayOnePhotoProps) {
  if (!photoPresentation.hasPhoto) {
    return null;
  }

  return (
    <PlaceImage
      photoHref={photoPresentation.photoHref}
      authorAttributions={photoPresentation.authorAttributions}
      showPoweredByGoogle
      presentation="compact"
      fallbackIcon={IconActivityOther}
      frameClassName={styles.dayOnePhotoFrame}
      imageClassName={styles.dayOnePhoto}
      alt=""
    />
  );
}
