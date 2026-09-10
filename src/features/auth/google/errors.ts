export class GoogleAuthError extends Error {
  constructor(message = "Google authentication failed") {
    super(message);
    this.name = "GoogleAuthError";
  }
}

export class GoogleAccountConflictError extends GoogleAuthError {
  constructor() {
    super("Google account conflict");
    this.name = "GoogleAccountConflictError";
  }
}

export class GoogleIdentityInvalidError extends GoogleAuthError {
  constructor() {
    super("Google identity invalid");
    this.name = "GoogleIdentityInvalidError";
  }
}

export class GoogleOAuthStateError extends GoogleAuthError {
  constructor() {
    super("OAuth state invalid");
    this.name = "GoogleOAuthStateError";
  }
}
