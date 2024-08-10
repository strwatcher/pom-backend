export type HashPassword = (password: string) => Promise<string>;
export const hashPassword: HashPassword = Bun.password.hash;

export type VerifyPassword = (
  password: string,
  hash: string,
) => Promise<boolean>;
export const verifyPassword: VerifyPassword = Bun.password.verify;
