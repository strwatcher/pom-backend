import { authServiceProvider } from './provider';
import { handleAuthSuccess, handleSignInErrors, handleSignUpErrors } from './responses';
import { authUserSchema } from '@/modules/users/model';
import { handleValidationErrors } from '@/shared/errors/validation';
import { TE, pipe } from '@/shared/fp-ts';
import Elysia from 'elysia';

export const auth = new Elysia()
    .use(authServiceProvider())
    .use(handleValidationErrors)
    .group('/auth', (group) =>
        group
            .post(
                '/sign-up',
                ({ authService, ...context }) =>
                    pipe(
                        authService.signUp(context),
                        TE.fold(handleSignUpErrors, handleAuthSuccess),
                    ),
                { body: authUserSchema },
            )
            .post(
                '/sign-in',
                ({ authService, ...context }) =>
                    pipe(
                        authService.signIn(context),
                        TE.fold(handleSignInErrors, handleAuthSuccess),
                    ),
                {
                    body: authUserSchema,
                },
            ),
    );
