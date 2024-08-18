import { handleUnhandledErrors } from './shared/errors/handle-unhandled';
import { auth } from '@/modules/auth';
import { progress } from '@/modules/progress';
import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';

const app = new Elysia()
    .use(swagger())
    .use(handleUnhandledErrors)
    .use(auth)
    .use(progress)
    .get('/', () => 'Hello')
    .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
