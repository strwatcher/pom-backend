import { T } from "@/shared/fp-ts";

export const invoke = (task: T.Task<unknown>) => task();
