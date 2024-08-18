import {
    RequestOriginIsNotVerifiedError,
    SessionIsNotExistError,
    SessionIsNotValidError,
} from './check-auth.model';
import { luciaProvider } from './provider';
import { B, O, pipe, T, TE } from '@/shared/fp-ts';
import { invoke, throws } from '@/shared/tasks';
import Elysia, { Cookie } from 'elysia';
import { Lucia, Session, verifyRequestOrigin } from 'lucia';

type ForSignedOnlyParams = {
    request: Request;
    lucia: Lucia;
    cookie: Record<string, Cookie<string | undefined>>;
};

export const checkAuthService = {
    forSignedOnly: (context: ForSignedOnlyParams) =>
        pipe(
            context.request.method === 'GET',
            B.fold(
                () =>
                    pipe(
                        O.Do,
                        O.bind('originHeader', () =>
                            pipe(context.request.headers.get('Origin'), O.fromNullable),
                        ),
                        O.bind('hostHeader', () =>
                            pipe(context.request.headers.get('Host'), O.fromNullable),
                        ),
                        O.bind('isVerified', ({ originHeader, hostHeader }) =>
                            pipe(
                                verifyRequestOrigin(originHeader, [hostHeader]),
                                O.fromPredicate(Boolean),
                            ),
                        ),
                    ),
                () => O.some({}),
            ),
            O.fold(
                () => TE.left(new RequestOriginIsNotVerifiedError()),
                () =>
                    pipe(
                        O.fromNullable(context.request.headers.get('Cookie')),
                        O.flatMap((sessionId) =>
                            pipe(context.lucia.readSessionCookie(sessionId), O.fromNullable),
                        ),
                        O.fold(
                            () => TE.left(new SessionIsNotExistError()),
                            (sessionId) =>
                                pipe(
                                    TE.tryCatch(
                                        async () => context.lucia.validateSession(sessionId),
                                        () => new SessionIsNotValidError(),
                                    ),
                                ),
                        ),
                    ),
            ),
            TE.flatMap(({ session, user }) =>
                pipe(
                    O.fromPredicate((session: Session | null) => !session || session.fresh)(
                        session,
                    ),
                    O.fold(
                        () => TE.of({ session, user }),
                        (session) =>
                            pipe(
                                O.fromNullable(session),
                                O.fold(
                                    () => TE.of(context.lucia.createBlankSessionCookie()),
                                    (session) =>
                                        TE.of(context.lucia.createSessionCookie(session.id)),
                                ),
                                TE.map((cookie) =>
                                    context.cookie[cookie.name].set({
                                        value: cookie.value,
                                        ...cookie.attributes,
                                    }),
                                ),
                                TE.map(() => ({ session, user })),
                            ),
                    ),
                ),
            ),
            TE.fold(throws, (result) => T.of(result)),
            invoke,
        ),
};

export const forSignedOnly = () =>
    new Elysia().use(luciaProvider()).derive(checkAuthService.forSignedOnly);
