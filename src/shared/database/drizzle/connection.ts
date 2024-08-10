import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const client = new Client({
  connectionString: Bun.env.POSTGRES_CONNECTION_STRING,
});

await client.connect();
export const db = drizzle(client, { schema });
