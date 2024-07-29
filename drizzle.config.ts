import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/shared/database/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_CONNECTION_STRING,
  },
});
