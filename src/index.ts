import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { auth } from "./resources/auth/routes";

const app = new Elysia()
  .use(swagger())
  .use(auth)
  .get("/", () => "Hello")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
