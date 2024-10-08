import { users } from '../users/model';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp('expiresAt', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
});
