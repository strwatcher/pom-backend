import { BaseApiError } from '@/shared/errors/base';

export class PasswordGenerationError extends BaseApiError {
    constructor(cause: unknown) {
        super(500, String(cause));
    }
}

export class PasswordVerificationError extends BaseApiError {
    constructor(cause: unknown) {
        super(500, String(cause));
    }
}

export class PasswordIsIncorrectError extends BaseApiError {
    constructor() {
        super(401, 'Password is incorrect');
    }
}
