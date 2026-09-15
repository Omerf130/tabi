"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconActivityRestaurant } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { TripHomeActivityCard } from "./types";
import styles from "./TripHomeContent.module.scss";

type UpNextCardProps = {
  card: TripHomeActivityCard;
};

export function UpNextCard({ card }: UpNextCardProps) {
  const tHome = useTranslations("Home");
  const navAction = card.navigationHref ? (
    <Link
      href={card.navigationHref}
      className={styles.duringSemanticNavLink}
      data-tone="up-next"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tHome("navigateTo", { name: card.title })}
    >
      <IconActivityRestaurant className={styles.duringSemanticIconGlyph} aria-hidden />
    </Link>
  ) : (
    <span className={styles.duringSemanticIcon} data-tone="up-next" aria-hidden>
      <IconActivityRestaurant className={styles.duringSemanticIconGlyph} />
    </span>
  );

  return (
    <article className={styles.duringUpNextCard} aria-labelledby="trip-home-up-next">
      {navAction}

      <div className={styles.duringCompactMain}>
        <p className={styles.duringUpNextEyebrow} id="trip-home-up-next">
          {tHome("upNextEyebrow")}
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
          fallbackIcon="activity-other"
          frameClassName={styles.duringCompactThumbFrame}
          imageClassName={styles.duringCompactThumbImage}
          fallbackClassName={styles.duringCompactThumbFallback}
          alt={card.title}
        />
      </div>
    </article>
  );
}
