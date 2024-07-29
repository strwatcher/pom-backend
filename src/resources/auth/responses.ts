import * as T from "fp-ts/Task";
import { match } from "ts-pattern";
import { constant } from "fp-ts/lib/function";
import { UserWithThisNameAlreadyExistsError } from "../users/model";

export const handleSignUpErrors = (error: Error) =>
  T.of(
    Response.json(
      { error: error.message },
      {
        status: match({ error })
          .when(
            ({ error }) => error instanceof UserWithThisNameAlreadyExistsError,
            constant(409),
          )
          .otherwise(constant(400)),
      },
    ),
  );

export const handleSignUpSuccess = (sessionCookie: string) =>
  T.of(
    Response.json(null, {
      status: 200,
      headers: { "Set-Cookie": sessionCookie },
    }),
  );
