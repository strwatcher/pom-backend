import { Database } from "@/shared/database/drizzle";
import { Lucia } from "lucia";
import {
  AuthUserDto,
  UserWithThisNameAlreadyExistsError,
} from "../users/model";
import { UsersService } from "../users/service";
import { createId } from "@paralleldrive/cuid2";
import { SerializedSessionCookie } from "./model";
import {
  createLuciaSession,
  generatePasswordHash,
  verifyPassword,
} from "./lib";
import { B, E, pipe, RTE, TE } from "@/shared/fp-ts";

type AuthParams = {
  database: Database;
  lucia: Lucia;
  body: AuthUserDto;

  usersService: UsersService;
};

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

const signIn: RTE.ReaderTaskEither<AuthParams, Error, string> = ({
  usersService,
  body,
  database,
  lucia,
}) =>
  pipe(
    usersService.getUserByName({ name: body.name, database }),
    TE.flatMap((user) =>
      verifyPassword({
        verify: Bun.password.verify,
        password: body.password,
        user,
      }),
    ),
    TE.flatMap((user) => createLuciaSession({ lucia, userId: user.id })),
  );

export const authService = {
  signUp,
  signIn,
};
