import { hashFunction, verify } from "@/mocks/password";
import { FullUser } from "@/modules/users/model";
import { T, TE, pipe } from "@/shared/fp-ts";
import { invoke, throws } from "@/shared/tasks";
import { describe, expect, it } from "bun:test";
import {
  PasswordGenerationError,
  PasswordIsIncorrectError,
  PasswordVerificationError,
} from "./model";
import { setupPasswordService } from "./service";

describe("Password service", () => {
  const passwordService = setupPasswordService({
    hash: hashFunction,
    verify,
  });
  const user: FullUser = { password: "test-hash", name: "test", id: "0" };
  const hashParams = { password: "test" } as const;
  const verifyParams = { password: "test", user } as const;

  it("Should use hash generator function and return string", async () => {
    hashFunction.mockImplementationOnce(
      async (password: string) => `${password}-hash`,
    );

    expect(
      await pipe(
        passwordService.generatePasswordHash(hashParams),
        TE.fold(throws, (hash) => T.of(hash)),
        invoke,
      ),
    ).toBe("test-hash");
  });

  it("Should throw PasswordGenerationError if hash generator fails", async () => {
    hashFunction.mockImplementationOnce(throws);

    expect(
      pipe(
        passwordService.generatePasswordHash(hashParams),
        TE.getOrElseW(throws),
      ),
    ).toThrowError(PasswordGenerationError);
  });

  it("Should use verify function and return user from args", async () => {
    verify.mockImplementationOnce(T.of(true));
    expect(
      await pipe(
        passwordService.verifyPassword(verifyParams),
        TE.fold(throws, (user) => T.of(user)),
        invoke,
      ),
    ).toEqual(user);
  });

  it("Should throws an PasswordIsIncorrectError if verification is not successful", () => {
    verify.mockImplementationOnce(T.of(false));
    expect(
      pipe(passwordService.verifyPassword(verifyParams), TE.getOrElseW(throws)),
    ).toThrowError(PasswordIsIncorrectError);
  });

  it("Should throws PasswordVerificationError if verification fails", async () => {
    verify.mockImplementationOnce(() => {
      throw "";
    });
    expect(
      pipe(passwordService.verifyPassword(verifyParams), TE.getOrElseW(throws)),
    ).toThrowError(PasswordVerificationError);
  });
});
