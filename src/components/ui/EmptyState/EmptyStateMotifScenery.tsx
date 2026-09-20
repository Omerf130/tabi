import type { EmptyStateVisualMotif, EmptyStateVisualScale } from "./empty-state-visual.types";
import styles from "./EmptyStateVisual.module.scss";

type MotifSceneryProps = {
  motif: EmptyStateVisualMotif;
  scale: EmptyStateVisualScale;
};

function TravelRoute({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 80 40" aria-hidden focusable={false}>
      <path
        d="M4 28 C 22 8, 38 34, 58 14 S 76 6, 76 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MapFold({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 88 64" aria-hidden focusable={false}>
      <path
        d="M12 52 L12 16 L44 8 L76 16 L76 52 L44 60 Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M44 8 L44 60"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.35"
        fill="none"
      />
      <path
        d="M12 16 L44 8 L76 16"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.25"
        fill="none"
      />
    </svg>
  );
}

function TicketStack({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 72 56" aria-hidden focusable={false}>
      <rect
        x="10"
        y="14"
        width="48"
        height="32"
        rx="4"
        fill="currentColor"
        opacity="0.12"
        transform="rotate(-6 34 30)"
      />
      <rect x="14" y="10" width="48" height="32" rx="4" fill="currentColor" opacity="0.18" />
      <circle cx="22" cy="26" r="5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function SuitcaseHero({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 72 64" aria-hidden focusable={false}>
      <rect x="14" y="22" width="44" height="34" rx="6" fill="currentColor" opacity="0.92" />
      <rect x="14" y="22" width="44" height="8" rx="6" fill="currentColor" opacity="0.75" />
      <path
        d="M28 22 V14 C28 10 32 8 36 8 C40 8 44 10 44 14 V22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <rect x="32" y="34" width="8" height="10" rx="2" fill="var(--color-surface-elevated)" opacity="0.9" />
    </svg>
  );
}

function CompassDisc({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden focusable={false}>
      <circle cx="32" cy="32" r="26" fill="currentColor" opacity="0.12" />
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path d="M32 12 L35 32 L32 52 L29 32 Z" fill="currentColor" opacity="0.45" />
      <path d="M12 32 L32 35 L52 32 L32 29 Z" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function CloudCluster({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 48" aria-hidden focusable={false}>
      <ellipse cx="36" cy="28" rx="28" ry="16" fill="currentColor" opacity="0.16" />
      <ellipse cx="62" cy="24" rx="22" ry="14" fill="currentColor" opacity="0.12" />
      <ellipse cx="88" cy="30" rx="26" ry="15" fill="currentColor" opacity="0.14" />
    </svg>
  );
}

function LeafCluster({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 40" aria-hidden focusable={false}>
      <ellipse cx="10" cy="28" rx="8" ry="12" fill="currentColor" opacity="0.35" transform="rotate(-25 10 28)" />
      <ellipse cx="20" cy="22" rx="7" ry="11" fill="currentColor" opacity="0.28" transform="rotate(15 20 22)" />
      <ellipse cx="14" cy="12" rx="6" ry="9" fill="currentColor" opacity="0.22" transform="rotate(-8 14 12)" />
    </svg>
  );
}

export function EmptyStateMotifScenery({ motif, scale }: MotifSceneryProps) {
  const isRich = scale === "full" || scale === "section" || scale === "config";

  if (!isRich || motif === "generic" || motif === "search") {
    return null;
  }

  return (
    <div className={styles.scenery} data-motif={motif}>
      <span className={styles.blobSky} />
      <span className={styles.blobWarm} />
      <span className={styles.blobSage} />

      {motif === "travel" ? (
        <>
          <LeafCluster className={styles.decorLeaves} />
          <TravelRoute className={styles.decorRoute} />
          {scale === "full" ? <SuitcaseHero className={styles.decorHero} /> : null}
        </>
      ) : null}

      {motif === "documents" ? (
        <>
          <MapFold className={styles.decorMap} />
          <span className={styles.decorPin} />
        </>
      ) : null}

      {motif === "transport" ? (
        <>
          <TicketStack className={styles.decorTickets} />
          <TravelRoute className={styles.decorRouteTransport} />
        </>
      ) : null}

      {motif === "weather" ? (
        <>
          <CloudCluster className={styles.decorClouds} />
          <CompassDisc className={styles.decorCompass} />
        </>
      ) : null}
    </div>
  );
}
