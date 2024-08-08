import { pipe, RTE, TE } from "@/shared/fp-ts";
import { Lucia } from "lucia";

export class LuciaCreateSessionError extends Error {
  constructor(cause: unknown) {
    super(String(cause));
    this.name = "LuciaCreateSessionError";
  }
}
type CreateSessionParams = {
  userId: string;
  lucia: Pick<Lucia, "createSession" | "createSessionCookie">;
};

export const createLuciaSession: RTE.ReaderTaskEither<
  CreateSessionParams,
  LuciaCreateSessionError,
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
