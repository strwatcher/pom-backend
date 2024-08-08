import { Database } from "@/shared/database/drizzle";
import { CreateUserDto, FullUser, UserNotFoundError, users } from "./model";
import { DrizzleError } from "drizzle-orm";
import { constTrue, pipe, RTE, TE } from "@/shared/fp-ts";

type GetUserByNameParams = {
  database: Database;
  name: string;
};

const getUserByName: RTE.ReaderTaskEither<
  GetUserByNameParams,
  DrizzleError | UserNotFoundError,
  FullUser
> = ({ name, database }: GetUserByNameParams) =>
    pipe(
      TE.tryCatch(
        () =>
          database.query.users.findFirst({
            where: (users, { eq }) => eq(users.name, name),
          }),
        (cause) =>
          new DrizzleError({
            message: `Error while trying to get user by name: ${name}`,
            cause,
          }),
      ),
      TE.flatMap(TE.fromNullable(new UserNotFoundError(name))),
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
  ): TE.TaskEither<DrizzleError | UserNotFoundError, boolean> =>
    pipe(params, getUserByName, TE.map(constTrue)),
};

export type UsersService = typeof usersService;
