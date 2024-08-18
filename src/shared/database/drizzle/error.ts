import { BaseApiError } from '@/shared/errors/base';

export class DrizzleError extends BaseApiError {
    constructor(cause: string) {
        super(500, cause);
    }
}
