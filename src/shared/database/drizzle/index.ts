import { db } from './connection';
import Elysia from 'elysia';

export * from './connection';

export const databaseProvider = () => new Elysia().decorate('database', db);
