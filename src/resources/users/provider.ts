import Elysia from "elysia";
import { usersService } from "./service";

export const usersServiceProvider = () =>
  new Elysia().decorate("usersService", usersService);
