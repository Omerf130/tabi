import type { TravelDocumentCategory } from "./constants";

export type TravelDocumentContextLink =
  | {
      type: "activity";
      activityId: string;
      title: string;
      date: string;
      activityType: string;
    }
  | {
      type: "accommodation";
      accommodationId: string;
      title: string;
      subtitle?: string;
    }
  | {
      type: "transport";
      transportId: string;
      title: string;
      subtitle?: string;
    };

export type TravelDocumentViewModel = {
  id: string;
  tripId: string;
  category: TravelDocumentCategory;
  categoryLabel: string;
  title: string;
  description?: string;
  fileContentType: string;
  fileTypeLabel: string;
  isPdf: boolean;
  isImage: boolean;
  fileHref: string;
  downloadHref: string;
  detailHref: string;
  contextLink?: TravelDocumentContextLink;
  createdAtLabel: string;
  sortDate: string;
};

export type TravelDocumentSettingsViewModel = TravelDocumentViewModel;

export type ActivityLinkOption = {
  id: string;
  label: string;
  date: string;
};

export type AccommodationLinkOption = {
  id: string;
  label: string;
};

export type TransportLinkOption = {
  id: string;
  label: string;
  departureDate: string;
};
