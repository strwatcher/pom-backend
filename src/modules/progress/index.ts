import { forSignedOnly } from '@/modules/auth';
import Elysia from 'elysia';

export const progress = new Elysia().use(forSignedOnly).get('/progress', (context) => {
    return context.user;
});
