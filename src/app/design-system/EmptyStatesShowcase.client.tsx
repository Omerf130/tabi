"use client";

import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  IconCurrency,
  IconDocuments,
  IconMapPin,
  IconPlane,
  IconSearch,
  IconTrain,
  IconWeather,
} from "@/components/ui/icons";
import { ProviderAlert } from "@/components/ui/ProviderAlert";
import styles from "./EmptyStatesShowcase.module.scss";

export function EmptyStatesShowcase() {
  return (
    <div className={styles.showcase}>
      <div className={styles.previewBlock}>
        <p className={styles.previewLabel}>Full</p>
        <EmptyState
          variant="full"
          visual={{
            motif: "travel",
            icon: <IconTrain />,
            accentIcon: <IconPlane />,
          }}
          title="No trips yet"
          description="Start planning and keep every journey in one place."
          primaryAction={{ label: "Plan a trip", href: "/app/trips/new" }}
          secondaryAction={{ label: "Learn how Tabi works", href: "#" }}
        />
      </div>

      <div className={styles.previewBlock}>
        <p className={styles.previewLabel}>Section — documents</p>
        <EmptyState
          variant="section"
          visual={{
            motif: "documents",
            icon: <IconDocuments />,
            accentIcon: <IconMapPin />,
          }}
          title="No documents"
          description="Add tickets and bookings so everyone on the trip can access them."
          primaryAction={{ label: "Upload a document", href: "#" }}
        />
      </div>

      <div className={styles.previewBlock}>
        <p className={styles.previewLabel}>Section — transport</p>
        <EmptyState
          variant="section"
          surface="subtle-bordered"
          visual={{
            motif: "transport",
            icon: <IconTrain />,
            accentIcon: <IconPlane />,
          }}
          title="No transport yet"
          description="Add flights, trains, and rides to keep the itinerary connected."
          primaryAction={{ label: "Add transport", href: "#" }}
        />
      </div>

      <div className={styles.previewBlock}>
        <p className={styles.previewLabel}>Inline</p>
        <EmptyState
          variant="inline"
          visual={{ motif: "generic", icon: <IconCurrency /> }}
          title="No expenses yet"
          primaryAction={{ label: "Add expense", href: "#" }}
        />
      </div>

      <div className={styles.previewBlock}>
        <p className={styles.previewLabel}>Search</p>
        <EmptyState
          variant="search"
          visual={{ motif: "search", icon: <IconSearch /> }}
          title="No matches"
          description="Try another keyword or clear the filter."
          primaryAction={{ label: "Clear search", href: "#" }}
        />
      </div>

      <div className={styles.previewBlock}>
        <p className={styles.previewLabel}>ConfigNotice</p>
        <ConfigNotice
          visual={{
            motif: "weather",
            icon: <IconWeather />,
            accentIcon: <IconSearch />,
          }}
          title="Choose a weather location"
          description="Pick a place to load the forecast and see the weather during your trip."
          primaryAction={{ label: "Search location", href: "#" }}
        />
      </div>

      <div className={styles.previewBlock}>
        <p className={styles.previewLabel}>ProviderAlert</p>
        <ProviderAlert
          icon={<IconCurrency />}
          title="Rates unavailable"
          message="Could not load exchange rates."
          retryAction={{ label: "Retry", onClick: () => undefined }}
          secondaryAction={{ label: "Change currencies", href: "#" }}
        />
      </div>
    </div>
  );
}
