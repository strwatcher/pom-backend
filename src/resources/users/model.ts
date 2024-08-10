import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull().unique(),
  password: text("password").notNull(),
});

export const fullUserSchema = createSelectSchema(users);
export const userSchema = t.Omit(fullUserSchema, ["password"]);

// TODO: add password and name validation rules
const _authUesrSchema = createInsertSchema(users);
export const authUserSchema = t.Omit(_authUesrSchema, ["id"]);

export type FullUser = typeof users.$inferSelect;
export type User = Omit<FullUser, "password">;
export type CreateUserDto = Required<typeof users.$inferInsert>;
export type AuthUserDto = Omit<typeof users.$inferInsert, "id">;
export type UserAttributes = Omit<User, "id">;

export class UserWithThisNameAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`User with name "${name}" already exists`);
  }
}

export class UserNotFoundError extends Error {
  constructor(name: string) {
    super(`User with name "${name}" is not found`);
  }
}
