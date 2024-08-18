import { sessions } from '@/modules/auth/model';
import { UserAttributes, users } from '@/modules/users/model';
import { db } from '@/shared/database/drizzle';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia, TimeSpan } from 'lucia';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: Bun.env.NODE_ENV === 'production',
        },
        expires: false,
    },
    getUserAttributes: (attributes) => {
        return {
            name: attributes.name,
        };
    },
    sessionExpiresIn: new TimeSpan(2, 'w'),
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: UserAttributes;
    }
}

export { lucia };
