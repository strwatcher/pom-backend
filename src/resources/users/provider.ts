import { databaseProvider } from "@/shared/database/drizzle";
import Elysia from "elysia";
import { setupUsersService } from "./service";

export const usersServiceProvider = () =>
  new Elysia()
    .use(databaseProvider())
    .derive(async ({ database }) => {
      return {
        usersService: setupUsersService({ database }),
      };
    })
    .as("plugin");
