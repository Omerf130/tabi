export const TRIP_THEME_ERROR_CODES = {
  validationFailed: "validationFailed",
  themeUnavailable: "themeUnavailable",
  notFound: "notFound",
  generic: "generic",
} as const;

export type TripThemeErrorCode =
  (typeof TRIP_THEME_ERROR_CODES)[keyof typeof TRIP_THEME_ERROR_CODES];

export type UpdateTripThemeActionState = {
  ok?: boolean;
  errorCode?: TripThemeErrorCode;
};

export const updateTripThemeActionInitialState: UpdateTripThemeActionState =
  {};
