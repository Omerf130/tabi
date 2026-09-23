import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IconNavigation } from "@/components/ui/icons";
import { PlaceImage } from "@/features/place-images/PlaceImage";
import type { TripHomeActivityCard } from "./types";
import styles from "./TripHomeContent.module.scss";

type ActivityCompactCardProps = {
  card: TripHomeActivityCard;
  tone: "now" | "up-next";
  eyebrow: string;
  headingId: string;
};

export async function ActivityCompactCard({
  card,
  tone,
  eyebrow,
  headingId,
}: ActivityCompactCardProps) {
  const tCommon = await getTranslations("Common");
  const hasPhoto = card.photoPresentation.hasPhoto;

  return (
    <article
      className={styles.activityCompactCard}
      data-tone={tone}
      data-has-photo={hasPhoto ? "true" : "false"}
      aria-labelledby={headingId}
    >
      <header className={styles.activityCompactTop}>
        <p className={styles.activityCompactEyebrow} id={headingId}>
          <span className={styles.activityCompactDot} aria-hidden />
          {eyebrow}
        </p>
        {card.timeLabel ? (
          <p className={styles.activityCompactTime}>{card.timeLabel}</p>
        ) : null}
      </header>

      <div
        className={styles.activityCompactBody}
        data-has-photo={hasPhoto ? "true" : "false"}
      >
        {hasPhoto ? (
          <div className={styles.activityCompactMedia}>
            <PlaceImage
              photoHref={card.photoPresentation.photoHref}
              authorAttributions={card.photoPresentation.authorAttributions}
              showPoweredByGoogle
              presentation="compact"
              fallbackIcon="activity-other"
              frameClassName={styles.activityCompactMediaFrame}
              imageClassName={styles.activityCompactMediaImage}
              alt={card.title}
            />
          </div>
        ) : null}

        <div className={styles.activityCompactMain}>
          <h3 className={styles.activityCompactTitle} dir="auto">
            {card.title}
          </h3>
          {card.locationName ? (
            <p className={styles.activityCompactLocation} dir="auto">
              {card.locationName}
            </p>
          ) : null}
          {card.navigationHref ? (
            <Link
              href={card.navigationHref}
              className={styles.activityCompactAction}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconNavigation className={styles.activityCompactActionIcon} aria-hidden />
              {tCommon("navigate")}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
