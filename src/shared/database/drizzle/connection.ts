import * as schema from './schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

export const client = new Client({
    connectionString: Bun.env.POSTGRES_CONNECTION_STRING,
});

await client.connect();
export const db = drizzle(client, { schema });
