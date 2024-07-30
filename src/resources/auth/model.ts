import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/model";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expiresAt", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type SerializedSessionCookie = string;

export class PasswordGenerationError extends Error {
  constructor(cause: unknown) {
    super(String(cause));
    this.name = "PasswordGenerationError";
  }
}

export class PasswordVerificationError extends Error {
  constructor(cause: unknown) {
    super(String(cause));
    this.name = "PasswordVerificationError";
  }
}

export class PasswordIsIncorrectError extends Error {
  constructor() {
    super("Password is incorrect");
    this.name = "PasswordIsIncorrectError";
  }
}
