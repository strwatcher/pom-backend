import { beforeAll, describe, expect, it, mock } from "bun:test";
import { usersService } from "./service";
import { throws } from "@/shared/errors/throws";
import { UserNotFoundError } from "./model";
import { DrizzleError } from "drizzle-orm";
import { pipe, TE } from "@/shared/fp-ts";
import { invoke } from "@/shared/tasks/invoke";
import { Database } from "@/shared/database/drizzle";

const name = "Ivan";
const mockUser = { id: "", name, password: "" };
const database = {
  query: {
    users: {},
  },
} as Database;

const findFirst = mock();

describe("Get user by name", () => {
  beforeAll(() => {
    database.query.users.findFirst = findFirst;
  });

  it("Should return FullUser in success case", async () => {
    findFirst.mockReturnValueOnce(Promise.resolve(mockUser));
    expect(
      await pipe(
        usersService.getUserByName({
          name,
          database,
        }),
        TE.getOrElseW(throws),
        invoke,
      ),
    ).toEqual(mockUser);
  });

  it("Should throw UserNotFoundError when no such user in database", async () => {
    findFirst.mockReturnValueOnce(Promise.resolve(undefined));
    expect(
      pipe(
        usersService.getUserByName({
          name,
          database,
        }),
        TE.getOrElseW(throws),
      ),
    ).toThrowError(UserNotFoundError);
  });

  it("Should throw DrizzleError when some error throws while database usage", async () => {
    findFirst.mockImplementationOnce(throws);
    expect(
      pipe(
        usersService.getUserByName({
          name,
          database,
        }),
        TE.getOrElseW(throws),
      ),
    ).toThrowError(DrizzleError);
  });
});
