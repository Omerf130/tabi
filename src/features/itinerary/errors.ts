export class ActivityNotFoundError extends Error {
  readonly code = "ACTIVITY_NOT_FOUND" as const;

  constructor() {
    super("Activity not found");
    this.name = "ActivityNotFoundError";
  }
}

export class ActivityDateOutOfRangeError extends Error {
  readonly code = "ACTIVITY_DATE_OUT_OF_RANGE" as const;

  constructor() {
    super("Activity date is outside trip range");
    this.name = "ActivityDateOutOfRangeError";
  }
}

export class ActivityValidationError extends Error {
  readonly code = "ACTIVITY_VALIDATION" as const;

  constructor(message: string) {
    super(message);
    this.name = "ActivityValidationError";
  }
}
