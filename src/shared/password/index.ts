import Elysia from "elysia";
import { setupPasswordService } from "./service";
import { hashPassword as hash, verifyPassword as verify } from "./utils";

export const passwordServiceProvider = () =>
  new Elysia().decorate(
    "passwordService",
    setupPasswordService({ hash, verify }),
  );
