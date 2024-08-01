import Elysia from "elysia";
import { lucia } from "./lib/lucia";
import { authService } from "./service";

export const luciaProvider = () => {
  return new Elysia().decorate("lucia", lucia);
};

export const authServiceProvider = () => {
  return new Elysia().decorate("authService", authService);
};
