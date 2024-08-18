import { Cookie } from 'elysia';

export const mockCookie = {
  auth: new Cookie<string>('auth', {}).set({ value: 'mockSessionId' }),
};
