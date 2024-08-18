import { T } from '@/shared/fp-ts';

export const handleAuthSuccess = (sessionCookie: string) =>
    T.of(
        Response.json(null, {
            status: 200,
            headers: { 'Set-Cookie': sessionCookie },
        }),
    );

export const handleSignOutSuccess = () => T.of(Response.json(null, { status: 200 }));
