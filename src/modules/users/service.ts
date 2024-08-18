import { UserNotFoundError, UserWithThisNameAlreadyExistsError } from './errors';
import { CreateUserDto, FullUser, users } from './model';
import { Database } from '@/shared/database/drizzle/database';
import { DrizzleError } from '@/shared/database/drizzle/error';
import { BaseApiError } from '@/shared/errors/base';
import { B, RTE, TE, pipe } from '@/shared/fp-ts';
import { isValuesSet } from '@/shared/guards/is-value-set';

type GetUserByNameFullParams = {
    database: Database;
    name: string;
};
type GetUserByNameParams = Pick<GetUserByNameFullParams, 'name'>;

type CreateUserFullParams = {
    database: Database;
    createUserDto: CreateUserDto;
};
type CreateUserParams = Pick<CreateUserFullParams, 'createUserDto'>;

export type UsersService = {
    getUserByName: RTE.ReaderTaskEither<GetUserByNameParams, BaseApiError, FullUser>;
    createUser: RTE.ReaderTaskEither<CreateUserParams, BaseApiError, string>;
    isNameAlreadyTaken: RTE.ReaderTaskEither<GetUserByNameParams, BaseApiError, boolean>;
};

const getUserByName = ({ name, database }: GetUserByNameFullParams) =>
    pipe(
        TE.tryCatch(
            () =>
                database.query.users.findFirst({
                    where: (users, { eq }) => eq(users.name, name),
                }),
            () => new DrizzleError(`Error while trying to get user by name: ${name}`),
        ),
    );

const isNameAlreadyTaken = (params: GetUserByNameFullParams) =>
    pipe(params, getUserByName, TE.map(isValuesSet));

const createUser = ({ createUserDto, database }: CreateUserFullParams) =>
    pipe(
        isNameAlreadyTaken({ database, name: createUserDto.name }),
        TE.flatMap(
            B.matchW(
                () =>
                    TE.tryCatch(
                        () => database.insert(users).values(createUserDto),
                        () => new DrizzleError('Error while trying to create user'),
                    ),
                () => TE.left(new UserWithThisNameAlreadyExistsError(createUserDto.name)),
            ),
        ),
        TE.map(() => createUserDto.id),
    );

export type SetupUsersServiceParams = {
    database: Database;
};

export type SetupUsersService = (params: SetupUsersServiceParams) => UsersService;

export const setupUsersService: SetupUsersService = ({ database }) => ({
    getUserByName: ({ name }) =>
        pipe(
            getUserByName({ database, name }),
            TE.flatMap(TE.fromNullable(new UserNotFoundError(name))),
        ),
    createUser: ({ createUserDto }) => createUser({ database, createUserDto }),
    isNameAlreadyTaken: ({ name }) => isNameAlreadyTaken({ database, name }),
});
