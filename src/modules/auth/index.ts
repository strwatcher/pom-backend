import { usersServiceProvider } from '../users/provider';
import { setupAuthService } from './auth.service';
import { checkAuthService } from './check-auth.service';
import { lucia } from './lib/lucia';
import { handleAuthSuccess, handleSignOutSuccess } from './responses';
import { authUserSchema } from '@/modules/users/model';
import { handleApiError } from '@/shared/errors/base';
import { TE, pipe } from '@/shared/fp-ts';
import { createIdProvider } from '@/shared/id';
import { passwordServiceProvider } from '@/shared/password';
import Elysia from 'elysia';
import { verifyRequestOrigin } from 'lucia';

export const luciaProvider = () => {
    return new Elysia()
        .decorate('lucia', lucia)
        .decorate('verifyRequestOrigin', verifyRequestOrigin);
};

export const authServiceProvider = () => {
    return new Elysia()
        .use(usersServiceProvider())
        .use(passwordServiceProvider())
        .use(createIdProvider())
        .use(luciaProvider())
        .derive((context) => {
            return {
                authService: setupAuthService(context),
            };
        })
        .as('plugin');
};

export const forSignedOnly = () =>
    new Elysia().use(luciaProvider()).derive(checkAuthService.forSignedOnly);

export const auth = new Elysia().use(authServiceProvider()).group('/auth', (group) =>
    group
        .post(
            '/sign-up',
            ({ authService, ...context }) =>
                pipe(authService.signUp(context), TE.fold(handleApiError, handleAuthSuccess)),
            { body: authUserSchema },
        )
        .post(
            '/sign-in',
            ({ authService, ...context }) =>
                pipe(authService.signIn(context), TE.fold(handleApiError, handleAuthSuccess)),
            {
                body: authUserSchema,
            },
        )
        .post('/sign-out', ({ authService, ...context }) =>
            pipe(authService.signOut(context), TE.fold(handleApiError, handleSignOutSuccess)),
        ),
);
