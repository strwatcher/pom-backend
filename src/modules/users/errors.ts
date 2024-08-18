import { BaseApiError } from '@/shared/errors/base';

export class UserWithThisNameAlreadyExistsError extends BaseApiError {
    constructor(name: string) {
        super(409, `User with name "${name}" already exists`);
    }
}

export class UserNotFoundError extends BaseApiError {
    constructor(name: string) {
        super(404, `User with name "${name}" is not found`);
    }
}
