import { Database } from "@/shared/database/drizzle";
import { Lucia } from "lucia";
import {
  AuthUserDto,
  UserWithThisNameAlreadyExistsError,
} from "../users/model";
import { UsersService } from "../users/service";
import { pipe } from "fp-ts/function";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as B from "fp-ts/boolean";
import { createId } from "@paralleldrive/cuid2";
import { SerializedSessionCookie } from "./model";

type AuthParams = {
  database: Database;
  lucia: Lucia;
  body: AuthUserDto;

  usersService: UsersService;
};

type GeneratePasswordHashParams = {
  password: string;
  hashFunction: typeof Bun.password.hash;
};

const generatePasswordHash: RTE.ReaderTaskEither<
  GeneratePasswordHashParams,
  Error,
  string
> = ({ password, hashFunction }) =>
  TE.tryCatch(
    () => hashFunction(password),
    (reason) => new Error(String(reason)),
  );

type CreateSessionParams = {
  userId: string;
  lucia: Lucia;
};

const createLuciaSession: RTE.ReaderTaskEither<
  CreateSessionParams,
  Error,
  string
> = ({ lucia, userId }) =>
  pipe(
    TE.tryCatch(
      () => lucia.createSession(userId, {}),
      (cause) => new Error(String(cause)),
    ),
    TE.map((session) => lucia.createSessionCookie(session.id)),
    TE.map((cookie) => cookie.serialize()),
  );

const signUp: RTE.ReaderTaskEither<
  AuthParams,
  Error,
  SerializedSessionCookie
> = ({ lucia, database, body, usersService }) =>
  pipe(
    usersService.isNameAlreadyTaken({ database, name: body.name }),
    TE.flatMap<boolean, Error, string>(
      pipe(
        B.matchW(
          () =>
            pipe(
              generatePasswordHash({
                password: body.password,
                hashFunction: Bun.password.hash,
              }),
              TE.flatMap<string, Error, string>((password) =>
                usersService.createUser({
                  database,
                  createUserDto: { ...body, password, id: createId() },
                }),
              ),
              TE.flatMap<string, Error, string>((userId) =>
                createLuciaSession({ userId, lucia }),
              ),
            ),
          () =>
            TE.fromEither(
              E.left(new UserWithThisNameAlreadyExistsError(body.name)),
            ),
        ),
      ),
    ),
  );

export const authService = {
  signUp,
  signIn: async ({ lucia, database, body }: AuthParams) => {},
};
