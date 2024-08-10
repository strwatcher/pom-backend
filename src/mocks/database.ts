import { mockUser } from './user';
import { Database } from '@/shared/database/drizzle/database';
import { mock } from 'bun:test';

export const usersFindFirst = mock().mockReturnValue(mockUser);
export const values = mock().mockImplementation(async () => {});
const insert = mock(() => ({ values }));
export const database = {
    query: {
        users: {
            findFirst: usersFindFirst,
        },
    },
    insert,
} as unknown as Database;
