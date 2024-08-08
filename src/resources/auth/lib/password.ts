import { FullUser } from "@/resources/users/model";
import { B, pipe, RTE, TE, E, constant } from "@/shared/fp-ts";

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

type GeneratePasswordHashParams = {
  password: string;
  hashFunction: typeof Bun.password.hash;
};

export const generatePasswordHash: RTE.ReaderTaskEither<
  GeneratePasswordHashParams,
  Error,
  string
> = ({ password, hashFunction }) =>
    TE.tryCatch(
      () => hashFunction(password),
      (cause) => new PasswordGenerationError(cause),
    );

type VerifyPasswordParams = {
  verify: typeof Bun.password.verify;
  password: string;
  user: FullUser;
};

export const verifyPassword: RTE.ReaderTaskEither<
  VerifyPasswordParams,
  PasswordVerificationError | PasswordIsIncorrectError,
  FullUser
> = ({ verify, password, user }) =>
    pipe(
      TE.tryCatch(
        () => verify(password, user.password),
        (cause) => new PasswordVerificationError(cause),
      ),
      TE.flatMapEither(
        B.match(
          constant(E.left(new PasswordIsIncorrectError())),
          constant(E.right(user)),
        ),
      ),
    );
