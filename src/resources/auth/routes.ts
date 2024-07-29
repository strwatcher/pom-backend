import Elysia from "elysia";
import { luciaProvider, authServiceProvider } from "./provider";
import { authUserSchema } from "@/resources/users/model";
import { databaseProvider } from "@/shared/database/drizzle";
import { authService } from "./service";
import { usersServiceProvider } from "../users/provider";
import { flow } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { handleValidationErrors } from "@/shared/errors/validation";
import { handleSignUpErrors, handleSignUpSuccess } from "./responses";

export const auth = new Elysia()
  .use(databaseProvider())
  .use(luciaProvider())
  .use(authServiceProvider())
  .use(usersServiceProvider())
  .use(handleValidationErrors)
  .group("/auth", (group) =>
    group
      .post(
        "/sign-up",
        flow(
          authService.signUp,
          TE.fold(handleSignUpErrors, handleSignUpSuccess),
        ),
        { body: authUserSchema },
      )
      .post("/sign-in", (context) => authService.signIn(context), {
        body: authUserSchema,
      }),
  );
