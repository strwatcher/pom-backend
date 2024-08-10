import Elysia from "elysia";
import { lucia } from "./lib/lucia";
import { setupAuthService, SetupAuthServiceParams } from "./service";
import { usersServiceProvider } from "../users/provider";
import { createId, createIdProvider } from "@/shared/id";
import { passwordServiceProvider } from "@/shared/password";

export const luciaProvider = () => {
  return new Elysia().decorate("lucia", lucia);
};

export const authServiceProvider = () => {
  return new Elysia()
    .use(usersServiceProvider())
    .use(passwordServiceProvider())
    .use(createIdProvider())
    .use(luciaProvider())
    .derive((context) => {
      return {
        authService: setupAuthService(context),
      };
    })
    .as("plugin");
};
