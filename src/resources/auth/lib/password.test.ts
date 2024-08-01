import { describe, expect, it } from "bun:test";
import { generatePasswordHash, verifyPassword } from "./password";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { PasswordGenerationError, PasswordVerificationError } from "../model";
import { FullUser } from "@/resources/users/model";

const successfulHashFunction = async (password: string) => `${password}-hash`;
describe("Password hash generation", () => {
  it("Should use hash generator function and return string", () => {
    pipe(
      generatePasswordHash({
        password: "test",
        hashFunction: successfulHashFunction,
      }),
      TE.flatMap((hash) => TE.of(expect(hash).toBe("test-hash"))),
    );
  });

  it("Should throw PasswordGenerationError if hash generator fails", async () => {
    const failingHashFunction = async (password: string) => {
      throw new PasswordGenerationError(
        `Failed to generate hash for ${password}`,
      );
    };

    const hashResult = await generatePasswordHash({
      password: "test",
      hashFunction: failingHashFunction,
    })();

    expect(() =>
      pipe(
        hashResult,
        E.getOrElseW((error) => {
          throw error;
        }),
      ),
    ).toThrowError(PasswordGenerationError);
  });
});

describe("Password hash verification", () => {
  const user: FullUser = { password: "test", name: "test", id: "0" };
  it("Should use verify function and return user from args", async () => {
    pipe(
      verifyPassword({
        password: "test-hash",
        user,
        verify: async (password: string, hash: string) =>
          (await successfulHashFunction(password)) === hash,
      }),
      TE.flatMap((verifiedUser) =>
        TE.of(expect(verifiedUser).toEqual(O.some(user))),
      ),
    );
  });

  it("Should return O.none if verification is not successful", async () => {
    pipe(
      verifyPassword({
        password: "tes-hash",
        user,
        verify: async (password: string, hash: string) =>
          (await successfulHashFunction(password)) === hash,
      }),
      TE.flatMap((verifiedUser) => TE.of(expect(verifiedUser).toEqual(O.none))),
    );
  });

  it("Should throws PasswordVerificationError if verification fails", async () => {
    const failingVerificationFunction = async (
      password: string,
      hash: string,
    ) => {
      throw new PasswordGenerationError(`Failed to verify ${hash} ${password}`);
    };

    const verificationResult = await verifyPassword({
      password: "test-hash",
      user,
      verify: failingVerificationFunction,
    })();

    expect(() =>
      pipe(
        verificationResult,
        E.getOrElseW((error) => {
          throw error;
        }),
      ),
    ).toThrowError(PasswordVerificationError);
  });
});
