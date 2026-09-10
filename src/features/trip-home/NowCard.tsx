"use client";

import Link from "next/link";
import { IconActivityOther, IconNavigation } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { TripHomeActivityCard } from "./types";
import styles from "./TripHomeContent.module.scss";

type NowCardProps = {
  card: TripHomeActivityCard;
};

export function NowCard({ card }: NowCardProps) {
  const navAction = card.googleMapsUrl ? (
    <Link
      href={card.googleMapsUrl}
      className={styles.duringSemanticNavLink}
      data-tone="now"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`ניווט ל${card.title}`}
    >
      <IconNavigation className={styles.duringSemanticIconGlyph} aria-hidden />
    </Link>
  ) : (
    <span className={styles.duringSemanticIcon} data-tone="now" aria-hidden>
      <IconNavigation className={styles.duringSemanticIconGlyph} />
    </span>
  );

  return (
    <article className={styles.duringNowCard} aria-labelledby="trip-home-now">
      {navAction}

      <div className={styles.duringCompactMain}>
        <p className={styles.duringNowEyebrow} id="trip-home-now">
          עכשיו
        </p>
        <h3 className={styles.duringCompactTitle} dir="auto">
          {card.title}
        </h3>
        {card.timeLabel ? (
          <p className={styles.duringCompactMeta}>{card.timeLabel}</p>
        ) : null}
      </div>

      <div className={styles.duringCompactThumb}>
        <PlaceImage
          photoHref={card.photoPresentation.photoHref}
          authorAttributions={card.photoPresentation.authorAttributions}
          showPoweredByGoogle={card.photoPresentation.hasPhoto}
          presentation="compact"
          fallbackIcon={IconActivityOther}
          frameClassName={styles.duringCompactThumbFrame}
          imageClassName={styles.duringCompactThumbImage}
          fallbackClassName={styles.duringCompactThumbFallback}
          alt={card.title}
        />
      </div>
    </article>
  );
}
