import { mock } from "bun:test";

export const mockPasswordHash = "password-hash";
export const hashFunction = mock().mockReturnValue(
  Promise.resolve(mockPasswordHash),
);

export const verify = mock().mockReturnValue(Promise.resolve(true));
