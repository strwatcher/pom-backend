import { T } from '@/shared/fp-ts';

export class BaseApiError extends Error {
    constructor(
        public status: number,
        cause: string,
    ) {
        super(cause);
    }

    public toResponse() {
        return Response.json({ message: this.message }, { status: this.status });
    }
}

export const handleApiError = (error: BaseApiError) => T.of(error.toResponse());
