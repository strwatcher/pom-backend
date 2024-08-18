import { AccessDeniedError } from '../errors';
import { B, O, pipe, TE } from '@/shared/fp-ts';
import { invoke, throws } from '@/shared/tasks';
import { Cookie } from 'elysia';
import { Lucia, Session } from 'lucia';

type ForSignedOnlyParams = {
    request: Request;
    lucia: Pick<
        Lucia,
        'readSessionCookie' | 'validateSession' | 'createBlankSessionCookie' | 'createSessionCookie'
    >;
    verifyRequestOrigin: (origin: string, hosts: string[]) => boolean;
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
                                context.verifyRequestOrigin(originHeader, [hostHeader]),
                                O.fromPredicate(Boolean),
                            ),
                        ),
                    ),
                () => O.some({}),
            ),
            O.fold(
                () => TE.left(new AccessDeniedError()),
                () =>
                    pipe(
                        O.fromNullable(context.request.headers.get('Cookie')),
                        O.flatMap((sessionId) =>
                            pipe(context.lucia.readSessionCookie(sessionId), O.fromNullable),
                        ),
                        O.fold(
                            () => TE.left(new AccessDeniedError()),
                            (sessionId) =>
                                pipe(
                                    TE.tryCatch(
                                        async () => context.lucia.validateSession(sessionId),
                                        () => new AccessDeniedError(),
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
            TE.getOrElseW(throws),
            invoke,
        ),
};
