import { setupAuthService } from '../service';
import { database, usersFindFirst } from '@/mocks/database';
import { createId } from '@/mocks/id';
import { hashFunction, verify } from '@/mocks/password';
import { lucia, mockSessionCookieSerialized } from '@/mocks/session';
import { mockUser } from '@/mocks/user';
import { UserNotFoundError, UserWithThisNameAlreadyExistsError } from '@/modules/users/model';
import { setupUsersService } from '@/modules/users/service';
import { TE, pipe } from '@/shared/fp-ts';
import { setupPasswordService } from '@/shared/password/service';
import { invoke, throws } from '@/shared/tasks';
import { describe, expect, it } from 'bun:test';

describe('Sign up', () => {
    const passwordService = setupPasswordService({ hash: hashFunction, verify });
    const usersService = setupUsersService({ database });
    const authService = setupAuthService({
        lucia,
        usersService,
        passwordService,
        createId,
    });

    it('Should return serialized Cookie in success case', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(undefined));

        expect(
            await pipe(
                authService.signUp({
                    body: mockUser,
                }),
                TE.getOrElseW(throws),
                invoke,
            ),
        ).toBe(mockSessionCookieSerialized);
    });

    it('Should throw UserWithThisNameAlreadyExistsError if user check fails', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(mockUser));
        expect(
            pipe(
                authService.signUp({
                    body: mockUser,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(UserWithThisNameAlreadyExistsError);
    });
});

describe('Sign in', () => {
    const passwordService = setupPasswordService({ hash: hashFunction, verify });
    const usersService = setupUsersService({ database });
    const authService = setupAuthService({
        lucia,
        usersService,
        passwordService,
        createId,
    });

    it('Should return serialized Cookie in success case', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(mockUser));
        expect(
            await pipe(
                authService.signIn({
                    body: mockUser,
                }),
                TE.getOrElseW(throws),
                invoke,
            ),
        ).toBe(mockSessionCookieSerialized);
    });

    it('Should throw UserNotFoundError if trying to sign-in with non-existing user', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(undefined));
        expect(
            pipe(
                authService.signIn({
                    body: mockUser,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(UserNotFoundError);
    });
});
