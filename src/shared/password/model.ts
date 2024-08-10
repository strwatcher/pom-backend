export class PasswordGenerationError extends Error {
  constructor(cause: unknown) {
    super(String(cause));
    this.name = "PasswordGenerationError";
  }
}

export class PasswordVerificationError extends Error {
  constructor(cause: unknown) {
    super(String(cause));
    this.name = "PasswordVerificationError";
  }
}

export class PasswordIsIncorrectError extends Error {
  constructor() {
    super("Password is incorrect");
    this.name = "PasswordIsIncorrectError";
  }
}
