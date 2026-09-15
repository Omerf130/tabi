import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { localeToIntlLocale, type AppLocale } from "@/features/i18n/locale";
import { buildTripManagementHref } from "@/features/trip-management/constants";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import type { TripWorkspace } from "@/features/trips/public-trip";
import {
  buildCurrencySettingsHref,
  buildSettingsLanguageHref,
  buildTravelersSettingsHref,
} from "./constants";
import type {
  SettingsHubRowViewModel,
  SettingsHubSectionViewModel,
  SettingsHubViewModel,
} from "./types";

function comingSoonRow(
  id: string,
  title: string,
  icon: SettingsHubRowViewModel["icon"],
  subtitle: string,
  tone?: SettingsHubRowViewModel["tone"],
): SettingsHubRowViewModel {
  return {
    id,
    title,
    subtitle,
    comingSoon: true,
    icon,
    tone,
  };
}

function activeRow(
  id: string,
  title: string,
  href: string,
  icon: SettingsHubRowViewModel["icon"],
  subtitle?: string,
): SettingsHubRowViewModel {
  return {
    id,
    title,
    href,
    comingSoon: false,
    icon,
    subtitle,
  };
}

type BuildSettingsHubViewModelInput = {
  trip: TripWorkspace;
  isOwner: boolean;
  baseCurrency: string;
  locale: AppLocale;
  t: AppTranslator<"Settings">;
};

export function buildSettingsHubViewModel({
  trip,
  isOwner,
  baseCurrency,
  locale,
  t,
}: BuildSettingsHubViewModelInput): SettingsHubViewModel {
  const destinationLabel = trip.destination?.displayName;

  const tripSection: SettingsHubSectionViewModel = {
    id: "trip",
    title: t("sections.trip"),
    rows: [
      activeRow(
        "trip-details",
        t("rows.tripDetails.title"),
        buildTripManagementHref(trip.id, "details"),
        "tripDetails",
        t("rows.tripDetails.subtitle"),
      ),
      activeRow(
        "travelers",
        t("rows.travelers.title"),
        buildTravelersSettingsHref(trip.id),
        "travelers",
        t("rows.travelers.subtitle"),
      ),
      comingSoonRow(
        "theme",
        t("rows.theme.title"),
        "theme",
        t("rows.theme.subtitle"),
      ),
      activeRow(
        "currency",
        t("rows.currency.title"),
        buildCurrencySettingsHref(trip.id),
        "currency",
        isOwner
          ? t("rows.currency.subtitleOwner", { currency: baseCurrency })
          : t("rows.currency.subtitleMember", { currency: baseCurrency }),
      ),
    ],
  };

  const preferencesSection: SettingsHubSectionViewModel = {
    id: "preferences",
    title: t("sections.preferences"),
    rows: [
      activeRow(
        "language",
        t("rows.language.title"),
        buildSettingsLanguageHref(trip.id),
        "language",
        t("rows.language.subtitle"),
      ),
      comingSoonRow(
        "maps",
        t("rows.maps.title"),
        "maps",
        t("rows.maps.subtitle"),
      ),
      comingSoonRow(
        "notifications",
        t("rows.notifications.title"),
        "notifications",
        t("rows.notifications.subtitle"),
      ),
    ],
  };

  const dataSection: SettingsHubSectionViewModel = {
    id: "data",
    title: t("sections.data"),
    rows: [
      comingSoonRow(
        "export",
        t("rows.export.title"),
        "export",
        t("rows.export.subtitle"),
      ),
      comingSoonRow(
        "delete-trip",
        t("rows.deleteTrip.title"),
        "deleteTrip",
        t("rows.deleteTrip.subtitle"),
        "muted-danger",
      ),
    ],
  };

  const accountSection: SettingsHubSectionViewModel = {
    id: "account",
    title: t("sections.account"),
    rows: [
      comingSoonRow(
        "profile",
        t("rows.profile.title"),
        "profile",
        t("rows.profile.subtitle"),
      ),
      comingSoonRow(
        "security",
        t("rows.security.title"),
        "security",
        t("rows.security.subtitle"),
      ),
      comingSoonRow(
        "help",
        t("rows.help.title"),
        "help",
        t("rows.help.subtitle"),
      ),
    ],
  };

  return {
    tripId: trip.id,
    tripName: trip.name,
    destinationLabel,
    dateRangeLabel: formatCalendarDateRangeDisplay(
      trip.startDate,
      trip.endDate,
      localeToIntlLocale(locale),
    ),
    sections: [tripSection, preferencesSection, dataSection, accountSection],
  };
}
