import { checkAuthService } from '../check-auth.service';
import { AccessDeniedError } from '../errors';
import { mockCookie } from '@/mocks/cookie';
import { mockGetHeaders, mockPostHeaders } from '@/mocks/headers';
import {
    lucia,
    mockSession,
    readSessionCookie,
    validateSession,
    verifyRequestOrigin,
} from '@/mocks/session';
import { mockUserWithoutPassword } from '@/mocks/user';
import { pipe } from '@/shared/fp-ts';
import { describe, expect, it } from 'bun:test';

const common = {
    lucia,
    cookie: mockCookie,
    verifyRequestOrigin,
};

describe('For signed only', () => {
    it('Successful sign check should return user and session', async () => {
        validateSession.mockReturnValueOnce({
            user: mockUserWithoutPassword,
            session: mockSession,
        });

        expect(
            await pipe(
                checkAuthService.forSignedOnly({
                    request: {
                        headers: mockGetHeaders,
                        method: 'GET',
                    } as Request,
                    ...common,
                }),
            ),
        ).toEqual({ user: mockUserWithoutPassword, session: mockSession });

        verifyRequestOrigin.mockReturnValueOnce(true);
        expect(
            await pipe(
                checkAuthService.forSignedOnly({
                    request: {
                        headers: mockPostHeaders,
                        method: 'POST',
                    } as Request,
                    ...common,
                }),
            ),
        ).toEqual({ user: mockUserWithoutPassword, session: mockSession });
    });

    it('No origin or host header in non-get request should throw access denied error', async () => {
        expect(() =>
            pipe(
                checkAuthService.forSignedOnly({
                    request: {
                        headers: mockGetHeaders,
                        method: 'POST',
                    } as Request,
                    ...common,
                }),
            ),
        ).toThrowError(AccessDeniedError);
    });

    it('No cookie header should throw access denied error', async () => {
        expect(() =>
            pipe(
                checkAuthService.forSignedOnly({
                    request: {
                        headers: new Headers(),
                        method: 'GET',
                    } as Request,
                    ...common,
                }),
            ),
        ).toThrowError(AccessDeniedError);
    });

    it('No session in cookies should throw access denied error', async () => {
        readSessionCookie.mockReturnValueOnce(null);
        expect(() =>
            pipe(
                checkAuthService.forSignedOnly({
                    request: {
                        headers: mockPostHeaders,
                        method: 'POST',
                    } as Request,
                    ...common,
                }),
            ),
        ).toThrowError(AccessDeniedError);
    });

    it('Failed session validation should throw access denied error', async () => {
        validateSession.mockImplementationOnce(() => {
            throw '';
        });
        expect(() =>
            pipe(
                checkAuthService.forSignedOnly({
                    request: {
                        headers: mockPostHeaders,
                        method: 'POST',
                    } as Request,
                    ...common,
                }),
            ),
        ).toThrowError(AccessDeniedError);
    });
});
