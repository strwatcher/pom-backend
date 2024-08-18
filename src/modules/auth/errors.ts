import { BaseApiError } from '@/shared/errors/base';

export class AccessDeniedError extends BaseApiError {
    constructor() {
        super(403, 'Access denied');
    }
}

export class LuciaCreateSessionError extends BaseApiError {
    constructor(cause: unknown) {
        super(400, String(cause));
    }
}

export class LuciaInvalidateSessionError extends BaseApiError {
    constructor() {
        super(400, 'Lucia invalidation error');
    }
}
