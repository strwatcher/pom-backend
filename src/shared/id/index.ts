import { createId as createIdE } from '@paralleldrive/cuid2';
import Elysia from 'elysia';

export type CreateId = () => string;
export const createId: CreateId = createIdE;

export const createIdProvider = () => new Elysia().decorate('createId', createId);
