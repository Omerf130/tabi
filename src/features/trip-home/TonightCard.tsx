"use client";

import Link from "next/link";
import { IconActivityHotel } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { TripHomeTonightCard } from "./types";
import styles from "./TripHomeContent.module.scss";

type TonightCardProps = {
  card: TripHomeTonightCard;
};

export function TonightCard({ card }: TonightCardProps) {
  const copy = (
    <>
      <h3 className={styles.duringTonightName} dir="auto">
        {card.name}
      </h3>
      <p className={styles.duringTonightCity} dir="auto">
        {card.city}
      </p>
    </>
  );

  return (
    <article className={styles.duringTonightCard} aria-labelledby="trip-home-tonight">
      <div className={styles.duringTonightHeader}>
        <IconActivityHotel className={styles.duringBlockIcon} aria-hidden />
        <p className={styles.duringBlockTitle} id="trip-home-tonight">
          הלילה
        </p>
      </div>

      <div className={styles.duringTonightBody}>
        <div className={styles.duringCompactThumb}>
          <PlaceImage
            photoHref={card.photoPresentation.photoHref}
            authorAttributions={card.photoPresentation.authorAttributions}
            showPoweredByGoogle={card.photoPresentation.hasPhoto}
            presentation="compact"
            fallbackIcon={IconActivityHotel}
            frameClassName={styles.duringCompactThumbFrame}
            imageClassName={styles.duringCompactThumbImage}
            fallbackClassName={styles.duringCompactThumbFallback}
            alt={card.name}
          />
        </div>

        {card.googleMapsUrl ? (
          <Link
            href={card.googleMapsUrl}
            className={styles.duringTonightCopyLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`ניווט ל${card.name}`}
          >
            {copy}
          </Link>
        ) : (
          <div className={styles.duringTonightCopy}>{copy}</div>
        )}
      </div>
    </article>
  );
}
