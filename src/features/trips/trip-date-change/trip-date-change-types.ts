export type TripDateChangeActivityImpactItem = {
  id: string;
  title: string;
  date: string;
};

export type TripDateChangeAccommodationDeleteItem = {
  id: string;
  label: string;
  checkInDate: string;
  checkOutDate: string;
};

export type TripDateChangeAccommodationClampItem = {
  id: string;
  label: string;
  fromCheckInDate: string;
  fromCheckOutDate: string;
  toCheckInDate: string;
  toCheckOutDate: string;
};

export type TripDateChangeTransportReviewItem = {
  id: string;
  type: string;
  departureLocationName: string;
  departureDate: string;
};

export type TripDateChangeReminderImpactItem = {
  id: string;
  date: string;
  text: string;
  travelerUserId: string;
};

export type TripDateChangeManualExpenseImpactItem = {
  id: string;
  expenseDate: string;
  title: string | null;
};

export type TripDateChangeImpact = {
  oldStartDate: string;
  oldEndDate: string;
  newStartDate: string;
  newEndDate: string;
  activitiesToDelete: TripDateChangeActivityImpactItem[];
  accommodationsToDelete: TripDateChangeAccommodationDeleteItem[];
  accommodationsToClamp: TripDateChangeAccommodationClampItem[];
  transportsToReview: TripDateChangeTransportReviewItem[];
  remindersOutOfRange: TripDateChangeReminderImpactItem[];
  manualExpensesOutOfRange: TripDateChangeManualExpenseImpactItem[];
  documentsUnlinkedCount: number;
};

export type TripDateChangeImpactPlan = TripDateChangeImpact & {
  impactHash: string;
  requiresConfirmation: boolean;
};

export type TripDateChangePreviewResult = {
  impact: TripDateChangeImpact;
  previewToken: string;
  requiresConfirmation: boolean;
};
