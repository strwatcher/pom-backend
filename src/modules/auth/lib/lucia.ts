import { sessions } from '../model';
import { UserAttributes, users } from '@/resources/users/model';
import { db } from '@/shared/database/drizzle';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: Bun.env.NODE_ENV === 'production',
        },
    },
    getUserAttributes: (attributes) => {
        return {
            name: attributes.name,
        };
    },
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: UserAttributes;
    }
}

export { lucia };
