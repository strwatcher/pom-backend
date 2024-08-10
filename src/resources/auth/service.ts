import {
  AuthUserDto,
  UserNotFoundError,
  UserWithThisNameAlreadyExistsError,
} from "@/resources/users/model";
import { pipe, RTE, TE } from "@/shared/fp-ts";
import { DrizzleError } from "drizzle-orm";
import { UsersService } from "../users/service";
import { Lucia } from "lucia";
import {
  PasswordGenerationError,
  PasswordIsIncorrectError,
  PasswordVerificationError,
} from "@/shared/password/model";
import { PasswordService } from "@/shared/password/service";
import { CreateId } from "@/shared/id";

export type AuthLucia = Pick<Lucia, "createSession" | "createSessionCookie">;

type AuthFullParams = {
  body: AuthUserDto;

  lucia: AuthLucia;
  usersService: UsersService;
  passwordService: PasswordService;
  createId: CreateId;
};

type AuthParams = Pick<AuthFullParams, "body">;

type SerializedSessionCookie = string;

export type AuthService = {
  signUp: RTE.ReaderTaskEither<
    AuthParams,
    | PasswordGenerationError
    | UserWithThisNameAlreadyExistsError
    | DrizzleError
    | LuciaCreateSessionError,
    SerializedSessionCookie
  >;
  signIn: RTE.ReaderTaskEither<
    AuthParams,
    | UserNotFoundError
    | DrizzleError
    | PasswordVerificationError
    | PasswordIsIncorrectError,
    SerializedSessionCookie
  >;
};

export type SetupAuthServiceParams = {
  lucia: AuthLucia;
  usersService: UsersService;
  passwordService: PasswordService;
  createId: CreateId;
};

export class LuciaCreateSessionError extends Error {
  constructor(cause: unknown) {
    super(String(cause));
    this.name = "LuciaCreateSessionError";
  }
}

type CreateSessionParams = {
  userId: string;
  lucia: AuthLucia;
};

export const createLuciaSession: RTE.ReaderTaskEither<
  CreateSessionParams,
  LuciaCreateSessionError,
  string
> = ({ lucia, userId }) =>
  pipe(
    TE.tryCatch(
      () => lucia.createSession(userId, {}),
      (cause) => new LuciaCreateSessionError(cause),
    ),
    TE.map((session) => lucia.createSessionCookie(session.id)),
    TE.map((cookie) => cookie.serialize()),
  );

type SetupAuthService = (params: SetupAuthServiceParams) => AuthService;

const signUp = ({
  usersService,
  passwordService,
  lucia,
  createId,
  body,
}: AuthFullParams) =>
  pipe(
    passwordService.generatePasswordHash({ password: body.password }),
    TE.flatMap((password) =>
      usersService.createUser({
        createUserDto: { ...body, password, id: createId() },
      }),
    ),

    TE.flatMap((userId) => createLuciaSession({ userId, lucia })),
  );

const signIn = ({
  usersService,
  passwordService,
  body,
  lucia,
}: AuthFullParams) =>
  pipe(
    usersService.getUserByName({ name: body.name }),
    TE.flatMap((user) =>
      passwordService.verifyPassword({
        password: body.password,
        user,
      }),
    ),
    TE.flatMap((user) => createLuciaSession({ lucia, userId: user.id })),
  );

export const setupAuthService: SetupAuthService = (injection) => ({
  signUp: ({ body }) => signUp({ ...injection, body }),
  signIn: ({ body }) => signIn({ ...injection, body }),
});
