export type SettingsRowIconId =
  | "tripDetails"
  | "travelers"
  | "theme"
  | "currency"
  | "language"
  | "maps"
  | "notifications"
  | "export"
  | "deleteTrip"
  | "profile"
  | "security"
  | "help"
  | "accommodations"
  | "transport"
  | "documents"
  | "reminders";

export type SettingsHubRowViewModel = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  comingSoon: boolean;
  icon: SettingsRowIconId;
  tone?: "default" | "muted-danger";
};

export type SettingsHubSectionViewModel = {
  id: string;
  title: string;
  rows: SettingsHubRowViewModel[];
};

export type SettingsHubViewModel = {
  tripId: string;
  tripName: string;
  destinationLabel?: string;
  dateRangeLabel: string;
  sections: SettingsHubSectionViewModel[];
};
