import { AccessDeniedError, LuciaInvalidateSessionError } from '../errors';
import { setupAuthService } from '../services/auth';
import { mockCookie } from '@/mocks/cookie';
import { database, usersFindFirst } from '@/mocks/database';
import { mockGetHeaders } from '@/mocks/headers';
import { createId } from '@/mocks/id';
import { hashFunction, verify } from '@/mocks/password';
import {
    invalidateSession,
    lucia,
    mockSessionCookieSerialized,
    readSessionCookie,
} from '@/mocks/session';
import { mockUser } from '@/mocks/user';
import { UserNotFoundError, UserWithThisNameAlreadyExistsError } from '@/modules/users/errors';
import { setupUsersService } from '@/modules/users/service';
import { TE, pipe } from '@/shared/fp-ts';
import { setupPasswordService } from '@/shared/password/service';
import { invoke, throws } from '@/shared/tasks';
import { describe, expect, it } from 'bun:test';

const setup = () => {
    const passwordService = setupPasswordService({ hash: hashFunction, verify });
    const usersService = setupUsersService({ database });
    const authService = setupAuthService({
        lucia,
        usersService,
        passwordService,
        createId,
    });

    return authService;
};

describe('Sign up', () => {
    const authService = setup();
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
    const authService = setup();

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

describe('Sign out', () => {
    const authService = setup();

    it('Should return void in success case', async () => {
        expect(
            await pipe(
                authService.signOut({
                    request: {
                        headers: mockGetHeaders,
                    } as Request,
                    cookie: mockCookie,
                }),
                TE.getOrElseW(throws),
                invoke,
            ),
        ).toBeEmpty();
    });

    it('Should throw AccessDeniedError if trying to sign-out without cookie header', async () => {
        expect(
            pipe(
                authService.signOut({
                    request: {
                        headers: new Headers(),
                    } as Request,
                    cookie: mockCookie,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(AccessDeniedError);
    });

    it('Should throw AccessDeniedError if trying to sign-out without session in cookie', async () => {
        readSessionCookie.mockReturnValueOnce(null);
        expect(
            pipe(
                authService.signOut({
                    request: {
                        headers: mockGetHeaders,
                    } as Request,
                    cookie: mockCookie,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(AccessDeniedError);
    });

    it('Should throw LuciaInvalidateSessionError if lucia.invalidateSession fails', async () => {
        invalidateSession.mockImplementationOnce(() => {
            throw '';
        });
        expect(
            pipe(
                authService.signOut({
                    request: {
                        headers: mockGetHeaders,
                    } as Request,
                    cookie: mockCookie,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(LuciaInvalidateSessionError);
    });
});
