import { Database } from "@/shared/database/drizzle";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import { CreateUserDto, FullUser, users } from "./model";
import * as O from "fp-ts/Option";
import { DrizzleError } from "drizzle-orm";

type GetUserByNameParams = {
  database: Database;
  name: string;
};

const getUserByName: RTE.ReaderTaskEither<
  GetUserByNameParams,
  DrizzleError,
  O.Option<FullUser>
> = ({ name, database }: GetUserByNameParams) =>
  pipe(
    TE.tryCatch(
      () =>
        database.query.users.findFirst({
          where: (users, { eq }) => eq(users.name, name),
        }),
      (cause: unknown) =>
        new DrizzleError({
          message: `Error while trying to get user by name: ${name}`,
          cause,
        }),
    ),
    TE.map(O.fromNullable),
  );

type CreateUserParams = {
  database: Database;
  createUserDto: CreateUserDto;
};

const createUser: RTE.ReaderTaskEither<
  CreateUserParams,
  DrizzleError,
  string
> = ({ createUserDto, database }: CreateUserParams) =>
  pipe(
    TE.tryCatch(
      () => database.insert(users).values(createUserDto),
      (cause: unknown) =>
        new DrizzleError({
          message: `Error while trying to create user`,
          cause,
        }),
    ),
    TE.map(() => createUserDto.id),
  );

export const usersService = {
  getUserByName,
  createUser,

  isNameAlreadyTaken: (
    params: GetUserByNameParams,
  ): TE.TaskEither<Error, boolean> =>
    pipe(params, getUserByName, TE.map(O.isSome)),
};

export type UsersService = typeof usersService;
