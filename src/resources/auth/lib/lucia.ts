import { Lucia } from "lucia";
import { UserAttributes, users } from "@/resources/users/model";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/shared/database/drizzle";
import { LuciaCreateSessionError, sessions } from "../model";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: Bun.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: UserAttributes;
  }
}

type CreateSessionParams = {
  userId: string;
  lucia: Lucia;
};

export const createLuciaSession: RTE.ReaderTaskEither<
  CreateSessionParams,
  Error,
  string
> = ({ lucia, userId }) =>
    pipe(
      TE.tryCatch(
        () => lucia.createSession(userId, {}),
        (cause) => new LuciaCreateSessionError(cause),
      ),
      TE.map((session) => lucia.createSessionCookie(session.id)),
      TE.map((cookie) => cookie.serialize()),
    );

export { lucia };
