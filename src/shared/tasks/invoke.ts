import { T } from '@/shared/fp-ts';

export const invoke = <V>(task: T.Task<V>) => task();
