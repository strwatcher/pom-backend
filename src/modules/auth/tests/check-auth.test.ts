import { checkAuthService } from '../check-auth.service';
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
import { Cookie } from 'elysia';

describe('For signed only', () => {
    it('Successful sign check should return user and session', async () => {
        readSessionCookie.mockReturnValueOnce(mockSession);
        validateSession.mockReturnValueOnce({
            user: mockUserWithoutPassword,
            session: mockSession,
        });

        expect(
            await pipe(
                checkAuthService.forSignedOnly({
                    request: {
                        headers: new Headers({ Cookie: 'auth=mockSessionId' }),
                        method: 'GET',
                    } as Request,
                    lucia,
                    cookie: {
                        auth: new Cookie<string>('auth', {}).set({ value: 'mockSessionId' }),
                    },
                    verifyRequestOrigin,
                }),
            ),
        ).toEqual({ user: mockUserWithoutPassword, session: mockSession });
    });
});
