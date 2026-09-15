import type {
  AccommodationLinkOption,
  ActivityLinkOption,
  TransportLinkOption,
} from "@/features/documents/types";
import type { CurrencyOption } from "@/features/currency/types";
import type { TripMemberRole } from "@/models/TripMember";

export type QuickAddAction =
  | "activity"
  | "accommodation"
  | "transport"
  | "reminder"
  | "expense"
  | "document";

export type QuickAddLinkDefaults = {
  activityId?: string;
  accommodationId?: string;
  transportId?: string;
};

export type QuickAddContext = {
  tripId: string;
  originPath: string;
  date?: string;
  linkDefaults?: QuickAddLinkDefaults;
};

export type QuickAddDocumentLinkOptions = {
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  transportOptions: TransportLinkOption[];
};

export type QuickAddBootstrap = {
  startDate: string;
  endDate: string;
  tripDates: readonly string[];
  financeBaseCurrency: string;
  currencies: readonly CurrencyOption[];
  showCostFields: boolean;
  documentLinkOptions: QuickAddDocumentLinkOptions;
  role: TripMemberRole;
};

export type QuickAddStep =
  | { kind: "menu" }
  | { kind: "transport-type" }
  | { kind: "form"; action: QuickAddAction; transportType?: string };

export type QuickAddOpenContext = Partial<
  Pick<QuickAddContext, "date" | "linkDefaults" | "originPath">
>;

export type QuickAddOpenOptions = {
  context?: QuickAddOpenContext;
  initialStep?: QuickAddStep;
};
