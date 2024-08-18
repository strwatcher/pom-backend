import { UsersService } from '../users/service';
import { SessionIsNotExistError } from './check-auth.model';
import {
    AuthUserDto,
    UserNotFoundError,
    UserWithThisNameAlreadyExistsError,
} from '@/modules/users/model';
import { O, RTE, TE, pipe } from '@/shared/fp-ts';
import { CreateId } from '@/shared/id';
import {
    PasswordGenerationError,
    PasswordIsIncorrectError,
    PasswordVerificationError,
} from '@/shared/password/model';
import { PasswordService } from '@/shared/password/service';
import { DrizzleError } from 'drizzle-orm';
import { Cookie } from 'elysia';
import { Lucia } from 'lucia';

export type AuthLucia = Pick<
    Lucia,
    | 'createSession'
    | 'createSessionCookie'
    | 'invalidateSession'
    | 'readSessionCookie'
    | 'createBlankSessionCookie'
>;

type AuthFullParams = {
    body: AuthUserDto;

    lucia: AuthLucia;
    usersService: UsersService;
    passwordService: PasswordService;
    createId: CreateId;
};

type AuthParams = Pick<AuthFullParams, 'body'>;

type SignOutFullParams = {
    lucia: AuthLucia;
    request: Request;
    cookie: Record<string, Cookie<string | undefined>>;
};

type SignOutParams = Pick<SignOutFullParams, 'request' | 'cookie'>;

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
        UserNotFoundError | DrizzleError | PasswordVerificationError | PasswordIsIncorrectError,
        SerializedSessionCookie
    >;

    signOut: RTE.ReaderTaskEither<SignOutParams, SessionIsNotExistError, void>;
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
        this.name = 'LuciaCreateSessionError';
    }
}

export class LuciaInvalidateSessionError extends Error {
    constructor() {
        super('Lucia invalidation error');
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

const signUp = ({ usersService, passwordService, lucia, createId, body }: AuthFullParams) =>
    pipe(
        passwordService.generatePasswordHash({ password: body.password }),
        TE.flatMap((password) =>
            usersService.createUser({
                createUserDto: { ...body, password, id: createId() },
            }),
        ),

        TE.flatMap((userId) => createLuciaSession({ userId, lucia })),
    );

const signIn = ({ usersService, passwordService, body, lucia }: AuthFullParams) =>
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

const signOut = ({ lucia, request, cookie }: SignOutFullParams) =>
    pipe(
        O.fromNullable(request.headers.get('Cookie')),
        O.flatMap((cookie) => pipe(lucia.readSessionCookie(cookie), O.fromNullable)),
        TE.fromOption(() => new SessionIsNotExistError()),
        TE.flatMap((sessionId) =>
            TE.tryCatch(
                () => lucia.invalidateSession(sessionId),
                () => new LuciaInvalidateSessionError(),
            ),
        ),
        TE.flatMap(() => TE.of(lucia.createBlankSessionCookie())),
        TE.flatMap((sessionCookie) =>
            TE.of(
                cookie[sessionCookie.name].set({
                    value: sessionCookie.value,
                    ...sessionCookie.attributes,
                }),
            ),
        ),
        TE.map(() => {}),
    );

export const setupAuthService: SetupAuthService = (injection) => ({
    signUp: ({ body }) => signUp({ ...injection, body }),
    signIn: ({ body }) => signIn({ ...injection, body }),
    signOut: ({ request, cookie }) => signOut({ ...injection, request, cookie }),
});
