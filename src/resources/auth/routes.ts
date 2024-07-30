import Elysia from "elysia";
import { luciaProvider, authServiceProvider } from "./provider";
import { authUserSchema } from "@/resources/users/model";
import { databaseProvider } from "@/shared/database/drizzle";
import { authService } from "./service";
import { usersServiceProvider } from "../users/provider";
import { flow } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { handleValidationErrors } from "@/shared/errors/validation";
import {
  handleSignUpErrors,
  handleAuthSuccess,
  handleSignInErrors,
} from "./responses";

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
          TE.fold(handleSignUpErrors, handleAuthSuccess),
        ),
        { body: authUserSchema },
      )
      .post(
        "/sign-in",
        flow(
          authService.signIn,
          TE.fold(handleSignInErrors, handleAuthSuccess),
        ),
        {
          body: authUserSchema,
        },
      ),
  );
