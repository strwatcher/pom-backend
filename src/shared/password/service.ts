import { BaseApiError } from '../errors/base';
import {
    PasswordGenerationError,
    PasswordIsIncorrectError,
    PasswordVerificationError,
} from './errors';
import { HashPassword, VerifyPassword } from './utils';
import { FullUser } from '@/modules/users/model';
import { B, E, RTE, TE, constant, pipe } from '@/shared/fp-ts';

type GeneratePasswordHashFullParams = {
    password: string;
    hash: HashPassword;
};

type GeneratePasswordHashParams = Pick<GeneratePasswordHashFullParams, 'password'>;

type VerifyPasswordFullParams = {
    verify: VerifyPassword;
    password: string;
    user: FullUser;
};

type VerifyPasswordParams = Pick<VerifyPasswordFullParams, 'user' | 'password'>;

export type PasswordService = {
    generatePasswordHash: RTE.ReaderTaskEither<GeneratePasswordHashParams, BaseApiError, string>;
    verifyPassword: RTE.ReaderTaskEither<VerifyPasswordParams, BaseApiError, FullUser>;
};

type SetupPasswordService = (params: {
    hash: HashPassword;
    verify: VerifyPassword;
}) => PasswordService;
export const setupPasswordService: SetupPasswordService = ({ hash, verify }) => ({
    generatePasswordHash: ({ password }) =>
        TE.tryCatch(
            () => hash(password),
            (cause) => new PasswordGenerationError(cause),
        ),
    verifyPassword: ({ password, user }) =>
        pipe(
            TE.tryCatch(
                () => verify(password, user.password),
                (cause) => new PasswordVerificationError(cause),
            ),
            TE.flatMapEither(
                B.match(constant(E.left(new PasswordIsIncorrectError())), constant(E.right(user))),
            ),
        ),
});
