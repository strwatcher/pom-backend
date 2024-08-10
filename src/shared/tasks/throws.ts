import { T } from '@/shared/fp-ts';

export function throws(error: unknown): T.Task<never> {
    throw error;
}
