import Link from "next/link";

import {

  IconAccommodation,

  IconChevron,

  IconCurrency,

  IconDictionary,

  IconGear,

  IconGrid,

  IconProgress,

  IconShield,

  IconTrain,

  IconWeather,

} from "@/components/ui/icons";

import { progressPercent } from "@/features/lists/ListProgressBar";

import { AccommodationPhoto } from "./AccommodationPhoto";

import { FinanceSummaryCard } from "./FinanceSummaryCard";

import type { TravelHubViewModel, TravelToolViewModel } from "./types";

import styles from "./TravelHub.module.scss";



type TravelHubContentProps = {

  model: TravelHubViewModel;

};



function TravelToolIcon({ tool }: { tool: TravelToolViewModel }) {

  switch (tool.id) {

    case "accommodations":

      return <IconAccommodation className={styles.toolIconSvg} />;

    case "lists":

      return <IconGrid className={styles.toolIconSvg} />;

    case "currency":

      return <IconCurrency className={styles.toolIconSvg} />;

    case "transport":

      return <IconTrain className={styles.toolIconSvg} />;

    case "language":

      return <IconDictionary className={styles.toolIconSvg} />;

    case "weather":

      return <IconWeather className={styles.toolIconSvg} />;

    case "emergency":

      return <IconShield className={styles.toolIconSvg} />;

    case "manage":

      return <IconGear className={styles.toolIconSvg} />;

    default:

      return <IconGrid className={styles.toolIconSvg} />;

  }

}



function SectionActionLink({ href, label }: { href: string; label: string }) {

  return (

    <Link href={href} className={styles.sectionActionLink}>

      {label}

      <IconChevron className={styles.sectionActionChevron} aria-hidden />

    </Link>

  );

}



function TravelToolCard({ tool }: { tool: TravelToolViewModel }) {

  const iconContainerClass = [

    styles.toolIconWrap,

    styles[tool.colorClass as keyof typeof styles],

  ]

    .filter(Boolean)

    .join(" ");



  const content = (

    <>

      <span className={iconContainerClass} aria-hidden>

        <TravelToolIcon tool={tool} />

      </span>

      <span className={styles.toolCopy}>

        <span className={styles.toolLabel}>{tool.label}</span>

        <span className={styles.toolDescription}>{tool.description}</span>

      </span>

      <IconChevron className={styles.toolChevron} aria-hidden />

    </>

  );



  if (tool.status === "active" && tool.href) {

    return (

      <Link href={tool.href} className={styles.toolCard}>

        {content}

      </Link>

    );

  }



  return (

    <div className={[styles.toolCard, styles.toolCardDisabled].join(" ")} aria-disabled="true">

      {content}

    </div>

  );

}



export function TravelHubContent({ model }: TravelHubContentProps) {

  const { contextualAccommodation, attentionList } = model;



  return (

    <div className={styles.hub}>

      <section className={styles.hero} aria-label="מרכז הטיול">

        <div className={styles.heroMedia} aria-hidden>

          {/* eslint-disable-next-line @next/next/no-img-element */}

          <img src={model.hero.heroImageSrc} alt="" className={styles.heroImage} />

          <div className={styles.heroScrim} />

        </div>

        <div className={styles.heroBody}>

          <h1 className={styles.heroTitle}>{model.hero.title}</h1>

          <p className={styles.heroSubtitle}>{model.hero.subtitle}</p>

        </div>

      </section>



      <Link href={model.myTrip.href} className={styles.myTripCard}>

        <span className={styles.myTripThumbWrap} aria-hidden>

          {/* eslint-disable-next-line @next/next/no-img-element */}

          <img src={model.myTrip.heroImageSrc} alt="" className={styles.myTripThumb} />

        </span>

        <span className={styles.myTripCopy}>

          <span className={styles.myTripEyebrow}>הטיול שלי</span>

          <span className={styles.myTripName} dir="auto">

            {model.myTrip.name}

          </span>

          <span className={styles.myTripDates}>{model.myTrip.dateRangeLabel}</span>

          <span className={styles.myTripMeta}>

            <span

              className={styles.myTripStatusDot}

              data-status={model.myTrip.statusLabel === "טיול הושלם" ? "completed" : "default"}

              aria-hidden

            />

            {model.myTrip.metaLabel}

          </span>

        </span>

        <IconChevron className={styles.myTripChevron} aria-hidden />

      </Link>



      <div className={styles.hubBody}>

        {contextualAccommodation ? (

          <section

            className={styles.section}

            aria-labelledby="contextual-accommodation-title"

          >

            <div className={styles.sectionHeader}>

              <div className={styles.sectionHeaderStart}>

                <IconAccommodation className={styles.sectionIcon} aria-hidden />

                <h2 id="contextual-accommodation-title" className={styles.sectionTitle}>

                  {contextualAccommodation.title}

                </h2>

              </div>

              <SectionActionLink

                href={contextualAccommodation.listHref}

                label="הצג הכול"

              />

            </div>



            <div className={styles.accommodationCard}>

              <div className={styles.accommodationThumb}>

                <AccommodationPhoto

                  placePhoto={contextualAccommodation.placePhoto}

                  showGoogleAttribution={contextualAccommodation.showGoogleAttribution}

                  alt={contextualAccommodation.accommodation.name}

                />

              </div>

              <Link

                href={contextualAccommodation.detailHref}

                className={styles.accommodationMainLink}

                aria-label={contextualAccommodation.accommodation.name}

              >

                <span className={styles.accommodationIdentity}>

                  <span className={styles.accommodationName} dir="auto">

                    {contextualAccommodation.accommodation.name}

                  </span>

                  <span className={styles.accommodationLocation} dir="auto">

                    {contextualAccommodation.accommodation.city}

                  </span>

                </span>

                <IconChevron className={styles.accommodationChevron} aria-hidden />

              </Link>

            </div>

          </section>

        ) : null}



        {attentionList ? (

          <section className={styles.section} aria-labelledby="attention-list-title">

            <div className={styles.sectionHeader}>

              <div className={styles.sectionHeaderStart}>

                <IconProgress className={styles.sectionIcon} aria-hidden />

                <h2 id="attention-list-title" className={styles.sectionTitle}>

                  התקדמות הטיול

                </h2>

              </div>

              <SectionActionLink href={attentionList.href} label="הצג פרטים" />

            </div>



            <Link href={attentionList.href} className={styles.progressCardLink}>

              <article className={styles.progressCard}>

                <p className={styles.progressPrimary}>{attentionList.attentionMessage}</p>

                <p className={styles.progressSecondary}>{attentionList.list.progressLabel}</p>

                <div

                  className={styles.progressTrack}

                  role="progressbar"

                  aria-valuenow={progressPercent(attentionList.list.progress)}

                  aria-valuemin={0}

                  aria-valuemax={100}

                  aria-label={`${attentionList.list.title}: ${attentionList.list.progressLabel}`}

                >

                  <div

                    className={styles.progressFill}

                    style={{ width: `${progressPercent(attentionList.list.progress)}%` }}

                  />

                </div>

              </article>

            </Link>

          </section>

        ) : null}



        <FinanceSummaryCard finance={model.finance} />



        <section className={styles.section} aria-labelledby="travel-tools-title">

          <h2 id="travel-tools-title" className={styles.toolsHeading}>

            כלי הטיול

          </h2>

          <div className={styles.toolsGrid}>

            {model.tools.map((tool) => (

              <TravelToolCard key={tool.id} tool={tool} />

            ))}

          </div>

        </section>

      </div>

    </div>

  );

}


