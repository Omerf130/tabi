export class InviteInvalidError extends Error {
  readonly code = "INVITE_INVALID" as const;

  constructor() {
    super("Invite invalid");
    this.name = "InviteInvalidError";
  }
}

export class AlreadyMemberError extends Error {
  readonly code = "ALREADY_MEMBER" as const;

  constructor() {
    super("Already a member");
    this.name = "AlreadyMemberError";
  }
}

export class InviteNotFoundError extends Error {
  readonly code = "INVITE_NOT_FOUND" as const;

  constructor() {
    super("Invite not found");
    this.name = "InviteNotFoundError";
  }
}
