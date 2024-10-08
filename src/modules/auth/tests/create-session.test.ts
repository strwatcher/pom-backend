import { LuciaCreateSessionError } from '../errors';
import { createLuciaSession } from '../services/auth';
import { createSession, lucia, mockSessionCookieSerialized } from '@/mocks/session';
import { T, TE, pipe } from '@/shared/fp-ts';
import { invoke, throws } from '@/shared/tasks';
import { describe, expect, it } from 'bun:test';

const userId = 'mock-user-id';
describe('Lucia session creation', () => {
    it('Succesful session creation should return session cookie', async () => {
        expect(
            await pipe(
                createLuciaSession({ userId, lucia }),
                TE.fold(throws, (cookie) => T.of(cookie)),
                invoke,
            ),
        ).toBe(mockSessionCookieSerialized);
    });

    it('Should throw LuciaCreateSessionError if something went wrong', () => {
        createSession.mockImplementationOnce(throws);
        expect(pipe(createLuciaSession({ userId, lucia }), TE.getOrElseW(throws))).toThrowError(
            LuciaCreateSessionError,
        );
    });
});
