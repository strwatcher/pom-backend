import { setupPasswordService } from './service';
import { hashPassword as hash, verifyPassword as verify } from './utils';
import Elysia from 'elysia';

export const passwordServiceProvider = () =>
    new Elysia().decorate('passwordService', setupPasswordService({ hash, verify }));
