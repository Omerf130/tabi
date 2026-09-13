import Link from "next/link";
import {
  IconAccommodation,
  IconChevron,
  IconCurrency,
  IconDictionary,
  IconDocuments,
  IconGear,
  IconGrid,
  IconShield,
  IconTrain,
  IconWeather,
} from "@/components/ui/icons";
import { AccommodationPhoto } from "./AccommodationPhoto";
import { FinanceSummaryCard } from "./FinanceSummaryCard";
import type {
  TravelHubMaterialsTile,
  TravelHubPrimaryToolRow,
  TravelHubQuickToolTile,
  TravelHubViewModel,
} from "./types";
import styles from "./TravelHub.module.scss";

type TravelHubContentProps = {
  model: TravelHubViewModel;
};

function PrimaryToolIcon({ title }: { title: string }) {
  if (title === "לינה") {
    return <IconAccommodation className={styles.primaryRowIconSvg} aria-hidden />;
  }
  if (title === "תחבורה") {
    return <IconTrain className={styles.primaryRowIconSvg} aria-hidden />;
  }
  return <IconGrid className={styles.primaryRowIconSvg} aria-hidden />;
}

function QuickToolIcon({ tool }: { tool: TravelHubQuickToolTile }) {
  switch (tool.id) {
    case "currency":
      return <IconCurrency className={styles.quickToolIconSvg} aria-hidden />;
    case "weather":
      return <IconWeather className={styles.quickToolIconSvg} aria-hidden />;
    case "language":
      return <IconDictionary className={styles.quickToolIconSvg} aria-hidden />;
    case "emergency":
      return <IconShield className={styles.quickToolIconSvg} aria-hidden />;
    default:
      return <IconGrid className={styles.quickToolIconSvg} aria-hidden />;
  }
}

function MaterialsIcon({ title }: { title: string }) {
  if (title === "מסמכים") {
    return <IconDocuments className={styles.materialsIconSvg} aria-hidden />;
  }
  return <IconGrid className={styles.materialsIconSvg} aria-hidden />;
}

function TravelHubPrimaryRow({ row }: { row: TravelHubPrimaryToolRow }) {
  const secondaryLine = row.emptyLine ?? row.detailLine;

  return (
    <Link href={row.href} className={styles.primaryRow}>
      {row.thumbnail ? (
        <span className={styles.primaryRowThumb} aria-hidden>
          <AccommodationPhoto
            placePhoto={row.thumbnail}
            showGoogleAttribution={row.showGoogleAttribution ?? false}
            alt={row.thumbnailAlt ?? row.title}
            hideAttribution
          />
        </span>
      ) : (
        <span className={styles.primaryRowIconWrap} aria-hidden>
          <PrimaryToolIcon title={row.title} />
        </span>
      )}

      <span className={styles.primaryRowCopy}>
        <span className={styles.primaryRowTitle}>{row.title}</span>
        {row.countLabel ? (
          <span className={styles.primaryRowMeta}>{row.countLabel}</span>
        ) : null}
        {secondaryLine ? (
          <span className={styles.primaryRowDetail} dir="auto">
            {secondaryLine}
          </span>
        ) : null}
      </span>

      <IconChevron className={styles.primaryRowChevron} aria-hidden />
    </Link>
  );
}

function TravelHubMaterialsTileLink({ tile }: { tile: TravelHubMaterialsTile }) {
  return (
    <Link href={tile.href} className={styles.materialsTile}>
      <span className={styles.materialsIconWrap} aria-hidden>
        <MaterialsIcon title={tile.title} />
      </span>
      <span className={styles.materialsCopy}>
        <span className={styles.materialsTitle}>{tile.primaryLine}</span>
        {tile.secondaryLine ? (
          <span className={styles.materialsMeta}>{tile.secondaryLine}</span>
        ) : null}
      </span>
    </Link>
  );
}

function TravelHubQuickToolTileLink({ tool }: { tool: TravelHubQuickToolTile }) {
  const colorClass = styles[tool.colorClass as keyof typeof styles];

  return (
    <Link href={tool.href} className={styles.quickToolTile}>
      <span
        className={[styles.quickToolIconWrap, colorClass].filter(Boolean).join(" ")}
        aria-hidden
      >
        <QuickToolIcon tool={tool} />
      </span>
      <span className={styles.quickToolCopy}>
        <span className={styles.quickToolLabel}>{tool.label}</span>
        <span className={styles.quickToolDescription}>{tool.description}</span>
      </span>
    </Link>
  );
}

export function TravelHubContent({ model }: TravelHubContentProps) {
  return (
    <div className={styles.hub}>
      <section className={styles.hero} aria-label="כלי הטיול">
        <div className={styles.heroMedia} aria-hidden>
          <img src={model.hero.heroImageSrc} alt="" className={styles.heroImage} />
          <div className={styles.heroScrim} />
        </div>
        <div className={styles.heroBody}>
          <h1 className={styles.heroTitle}>{model.hero.title}</h1>
          <p className={styles.heroSubtitle}>{model.hero.subtitle}</p>
        </div>
      </section>

      <div className={styles.hubBody}>
        <div className={styles.hubMain}>
          <section className={styles.primarySection} aria-label="כלי טיול עיקריים">
            <TravelHubPrimaryRow row={model.accommodation} />
            <TravelHubPrimaryRow row={model.transport} />
          </section>

          <FinanceSummaryCard finance={model.finance} />

          <section className={styles.materialsSection} aria-label="חומרים והכנה">
            <div className={styles.materialsGrid}>
              <TravelHubMaterialsTileLink tile={model.materials.lists} />
              <TravelHubMaterialsTileLink tile={model.materials.documents} />
            </div>
          </section>

          <Link href={model.management.href} className={styles.managementRow}>
            <span className={styles.managementIconWrap} aria-hidden>
              <IconGear className={styles.managementIconSvg} />
            </span>
            <span className={styles.managementLabel}>{model.management.label}</span>
            <IconChevron className={styles.managementChevron} aria-hidden />
          </Link>
        </div>

        <section className={styles.quickToolsSection} aria-label="כלי עזר מהירים">
          <div className={styles.quickToolsGrid}>
            {model.quickTools.map((tool) => (
              <TravelHubQuickToolTileLink key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
