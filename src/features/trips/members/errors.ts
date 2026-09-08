export class LastOwnerError extends Error {
  readonly code = "LAST_OWNER" as const;

  constructor() {
    super("Cannot remove or demote the last owner");
    this.name = "LastOwnerError";
  }
}

export class MemberNotFoundError extends Error {
  readonly code = "MEMBER_NOT_FOUND" as const;

  constructor() {
    super("Member not found");
    this.name = "MemberNotFoundError";
  }
}
