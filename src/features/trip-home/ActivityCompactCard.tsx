import Link from "next/link";
import { IconActivityOther, IconNavigation } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { TripHomeActivityCard } from "./types";
import styles from "./TripHomeContent.module.scss";

type ActivityCompactCardProps = {
  card: TripHomeActivityCard;
  tone: "now" | "up-next";
  eyebrow: string;
  headingId: string;
};

export function ActivityCompactCard({
  card,
  tone,
  eyebrow,
  headingId,
}: ActivityCompactCardProps) {
  const hasPhoto = card.photoPresentation.hasPhoto;

  return (
    <article
      className={styles.activityCompactCard}
      data-tone={tone}
      aria-labelledby={headingId}
    >
      <div className={styles.activityCompactMain}>
        <p className={styles.activityCompactEyebrow} id={headingId}>
          <span className={styles.activityCompactDot} aria-hidden />
          {eyebrow}
        </p>
        {card.timeLabel ? (
          <p className={styles.activityCompactTime}>{card.timeLabel}</p>
        ) : null}
        <h3 className={styles.activityCompactTitle} dir="auto">
          {card.title}
        </h3>
        {card.locationName ? (
          <p className={styles.activityCompactLocation} dir="auto">
            {card.locationName}
          </p>
        ) : null}
        {card.googleMapsUrl ? (
          <Link
            href={card.googleMapsUrl}
            className={styles.activityCompactAction}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconNavigation className={styles.activityCompactActionIcon} aria-hidden />
            ניווט
          </Link>
        ) : null}
      </div>

      {hasPhoto ? (
        <div className={styles.activityCompactThumb}>
          <PlaceImage
            photoHref={card.photoPresentation.photoHref}
            authorAttributions={card.photoPresentation.authorAttributions}
            showPoweredByGoogle
            presentation="compact"
            fallbackIcon={IconActivityOther}
            frameClassName={styles.activityCompactThumbFrame}
            imageClassName={styles.activityCompactThumbImage}
            alt={card.title}
          />
        </div>
      ) : null}
    </article>
  );
}
