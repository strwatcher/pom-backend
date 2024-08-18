import { UserNotFoundError, UserWithThisNameAlreadyExistsError } from '../users/model';
import { T, constant } from '@/shared/fp-ts';
import { PasswordIsIncorrectError } from '@/shared/password/model';
import { match } from 'ts-pattern';

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

export const handleSignInErrors = (error: Error) =>
    T.of(
        Response.json(
            { error: error.message },
            {
                status: match({ error })
                    .when(({ error }) => error instanceof PasswordIsIncorrectError, constant(403))
                    .when(({ error }) => error instanceof UserNotFoundError, constant(404))
                    .otherwise(constant(400)),
            },
        ),
    );

export const handleAuthSuccess = (sessionCookie: string) =>
    T.of(
        Response.json(null, {
            status: 200,
            headers: { 'Set-Cookie': sessionCookie },
        }),
    );

export const handleSignOutErrors = (error: Error) =>
    T.of(
        Response.json(
            {
                error: error.message,
            },
            { status: 400 },
        ),
    );

export const handleSignOutSuccess = () => T.of(Response.json(null, { status: 200 }));
