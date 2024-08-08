import { describe, expect, it, mock } from "bun:test";
import { Cookie } from "lucia";
import { createLuciaSession, LuciaCreateSessionError } from "./session";
import { throws } from "@/shared/errors/throws";
import { pipe, T, TE } from "@/shared/fp-ts";
import { invoke } from "@/shared/tasks/invoke";

const createSession = mock();
const createSessionCookie = mock();

const lucia = {
  createSession,
  createSessionCookie,
} as const;

const userId = "mock-user-id";
describe("Lucia session creation", () => {
  it("Succesful session creation should return session cookie", async () => {
    createSession.mockReturnValueOnce(
      Promise.resolve({
        id: "mock-id",
        fresh: true,
        userId,
        expiresAt: new Date(),
      }),
    );

    createSessionCookie.mockReturnValueOnce(new Cookie("auth", "mock-id", {}));

    expect(
      await pipe(
        createLuciaSession({
          userId,
          lucia,
        }),
        TE.fold(throws, (cookie) => T.of(cookie)),
        invoke,
      ),
    ).toBe("auth=mock-id");
  });

  it("Should throw LuciaCreateSessionError if something went wrong", () => {
    createSession.mockImplementationOnce(throws);
    expect(
      pipe(
        createLuciaSession({
          userId,
          lucia,
        }),
        TE.getOrElseW(throws),
      ),
    ).toThrowError(LuciaCreateSessionError);
  });
});
