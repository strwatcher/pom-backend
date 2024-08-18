import { usersServiceProvider } from '../users/provider';
import { setupAuthService } from './auth.service';
import { checkAuthService } from './check-auth.service';
import { lucia } from './lib/lucia';
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
