import { BaseApiError } from './base';
import { A, pipe } from '@/shared/fp-ts';
import Elysia from 'elysia';

export const handleUnhandledErrors = new Elysia().onError({ as: 'global' }, ({ error, code }) => {
    if (error instanceof BaseApiError) {
        return error.toResponse();
    }

    if (code === 'VALIDATION') {
        return Response.json(
            {
                error: pipe(
                    error.all,
                    A.map(({ summary }) => summary),
                ),
            },
            { status: 400 },
        );
    }
});
