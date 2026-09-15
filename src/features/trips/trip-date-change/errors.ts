import { TRIP_DATE_CHANGE_ERROR_CODES } from "./constants";

export class TripDateChangeNoChangeError extends Error {
  readonly code = TRIP_DATE_CHANGE_ERROR_CODES.noChange;

  constructor() {
    super(TRIP_DATE_CHANGE_ERROR_CODES.noChange);
    this.name = "TripDateChangeNoChangeError";
  }
}

export class TripDateChangeNotFoundError extends Error {
  readonly code = TRIP_DATE_CHANGE_ERROR_CODES.generic;

  constructor() {
    super("trip not found");
    this.name = "TripDateChangeNotFoundError";
  }
}

export class TripDateChangeStalePreviewError extends Error {
  readonly code = TRIP_DATE_CHANGE_ERROR_CODES.stalePreview;

  constructor() {
    super(TRIP_DATE_CHANGE_ERROR_CODES.stalePreview);
    this.name = "TripDateChangeStalePreviewError";
  }
}

export class TripDateChangeInvalidPreviewTokenError extends Error {
  readonly code = TRIP_DATE_CHANGE_ERROR_CODES.invalidPreviewToken;

  constructor() {
    super(TRIP_DATE_CHANGE_ERROR_CODES.invalidPreviewToken);
    this.name = "TripDateChangeInvalidPreviewTokenError";
  }
}
