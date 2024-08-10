import { UserNotFoundError, UserWithThisNameAlreadyExistsError } from './model';
import { setupUsersService } from './service';
import { database, usersFindFirst, values } from '@/mocks/database';
import { mockUser, name } from '@/mocks/user';
import { TE, pipe } from '@/shared/fp-ts';
import { invoke, throws } from '@/shared/tasks';
import { describe, expect, it } from 'bun:test';
import { DrizzleError } from 'drizzle-orm';

describe('Get user by name', () => {
    const usersService = setupUsersService({ database });

    it('Should return FullUser in success case', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(mockUser));
        expect(
            await pipe(
                usersService.getUserByName({
                    name,
                }),
                TE.getOrElseW(throws),
                invoke,
            ),
        ).toEqual(mockUser);
    });

    it('Should throw UserNotFoundError when no such user in database', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(undefined));
        expect(
            pipe(
                usersService.getUserByName({
                    name,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(UserNotFoundError);
    });

    it('Should throw DrizzleError when some error throws while database usage', async () => {
        usersFindFirst.mockImplementationOnce(throws);
        expect(
            pipe(
                usersService.getUserByName({
                    name,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(DrizzleError);
    });
});

describe('Is name already taken', () => {
    const usersService = setupUsersService({ database });

    it('Should return true in success case', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(mockUser));
        expect(
            await pipe(
                usersService.isNameAlreadyTaken({
                    name,
                }),
                TE.getOrElseW(throws),
                invoke,
            ),
        ).toBe(true);
    });

    it('Should return true when no such user in database', async () => {
        usersFindFirst.mockReturnValueOnce(Promise.resolve(undefined));
        expect(
            await pipe(
                usersService.isNameAlreadyTaken({
                    name,
                }),
                TE.getOrElseW(throws),
                invoke,
            ),
        ).toBe(false);
    });

    it('Should throw DrizzleError when some error throws while database usage', async () => {
        usersFindFirst.mockImplementationOnce(throws);
        expect(
            pipe(
                usersService.isNameAlreadyTaken({
                    name,
                }),
                TE.getOrElseW(throws),
            ),
        ).toThrowError(DrizzleError);
    });
});

describe('Create user', () => {
    const usersService = setupUsersService({ database });

    it('Should return new user id in success case', async () => {
        values.mockImplementationOnce(async () => {});
        usersFindFirst.mockReturnValueOnce(Promise.resolve(undefined));
        expect(
            await pipe(
                usersService.createUser({ createUserDto: mockUser }),
                TE.getOrElseW(throws),
                invoke,
            ),
        ).toBe(mockUser.id);
    });

    it('Should throw UserWithThisNameALreadyExistsError when user with this name already exists', async () => {
        values.mockImplementationOnce(async () => {});
        usersFindFirst.mockReturnValueOnce(Promise.resolve(mockUser));

        expect(
            pipe(usersService.createUser({ createUserDto: mockUser }), TE.getOrElseW(throws)),
        ).toThrowError(UserWithThisNameAlreadyExistsError);
    });

    it('Should throw DrizzleError when some error throws while database usage', async () => {
        values.mockImplementationOnce(throws);
        expect(
            pipe(usersService.createUser({ createUserDto: mockUser }), TE.getOrElseW(throws)),
        ).toThrowError(DrizzleError);
    });
});
