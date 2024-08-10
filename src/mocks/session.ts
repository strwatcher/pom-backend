import { mock } from 'bun:test';
import { Cookie, Session } from 'lucia';

const mockSessionId = 'mock-session-id';

export const mockSession: Session = {
    id: mockSessionId,
    fresh: true,
    userId: '',
    expiresAt: new Date(),
};
export const mockSessionCookie: Cookie = new Cookie('auth', mockSessionId, {});
export const mockSessionCookieSerialized = `auth=${mockSessionId}`;

export const createSession = mock().mockReturnValue(Promise.resolve(mockSession));
export const createSessionCookie = mock().mockReturnValue(mockSessionCookie);

export const lucia = {
    createSession,
    createSessionCookie,
} as const;
