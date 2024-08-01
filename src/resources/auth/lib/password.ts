import * as O from "fp-ts/Option";
import * as B from "fp-ts/boolean";
import { FullUser } from "@/resources/users/model";

import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { constant, pipe } from "fp-ts/lib/function";
import { PasswordGenerationError, PasswordVerificationError } from "../model";

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
  Error,
  O.Option<FullUser>
> = ({ verify, password, user }) =>
    pipe(
      TE.tryCatch(
        () => verify(password, user.password),
        (cause) => new PasswordVerificationError(cause),
      ),
      TE.map(B.fold(constant(O.none), constant(O.some(user)))),
    );
