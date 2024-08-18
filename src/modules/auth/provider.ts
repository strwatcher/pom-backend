import { usersServiceProvider } from '../users/provider';
import { setupAuthService } from './auth.service';
import { lucia } from './lib/lucia';
import { createIdProvider } from '@/shared/id';
import { passwordServiceProvider } from '@/shared/password';
import Elysia from 'elysia';

export const luciaProvider = () => {
    return new Elysia().decorate('lucia', lucia);
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
