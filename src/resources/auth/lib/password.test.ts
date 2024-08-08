import {
  generatePasswordHash,
  PasswordGenerationError,
  PasswordIsIncorrectError,
  PasswordVerificationError,
  verifyPassword,
} from "./password";
import { FullUser } from "@/resources/users/model";
import { throws } from "@/shared/errors/throws";
import { pipe, T, TE } from "@/shared/fp-ts";
import { invoke } from "@/shared/tasks/invoke";
import { mock, describe, it, expect } from "bun:test";

const hashFunction = mock();
const verify = mock();

describe("Password hash generation", () => {
  const hashParams = { password: "test", hashFunction } as const;
  it("Should use hash generator function and return string", async () => {
    hashFunction.mockImplementationOnce(
      async (password: string) => `${password}-hash`,
    );

    expect(
      await pipe(
        generatePasswordHash(hashParams),
        TE.fold(throws, (hash) => T.of(hash)),
        invoke,
      ),
    ).toBe("test-hash");
  });

  it("Should throw PasswordGenerationError if hash generator fails", async () => {
    hashFunction.mockImplementationOnce(throws);

    expect(
      pipe(generatePasswordHash(hashParams), TE.getOrElseW(throws)),
    ).toThrowError(PasswordGenerationError);
  });
});

describe("Password hash verification", () => {
  const user: FullUser = { password: "test-hash", name: "test", id: "0" };
  const verifyParams = { password: "test", user, verify } as const;

  it("Should use verify function and return user from args", async () => {
    verify.mockImplementationOnce(T.of(true));
    expect(
      await pipe(
        verifyPassword(verifyParams),
        TE.fold(throws, (user) => T.of(user)),
        invoke,
      ),
    ).toEqual(user);
  });

  it("Should throws an PasswordIsIncorrectError if verification is not successful", () => {
    verify.mockImplementationOnce(T.of(false));
    expect(
      pipe(verifyPassword(verifyParams), TE.getOrElseW(throws)),
    ).toThrowError(PasswordIsIncorrectError);
  });

  it("Should throws PasswordVerificationError if verification fails", async () => {
    verify.mockImplementationOnce(throws);
    expect(
      pipe(verifyPassword(verifyParams), TE.getOrElseW(throws)),
    ).toThrowError(PasswordVerificationError);
  });
});
