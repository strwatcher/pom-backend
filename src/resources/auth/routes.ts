import Elysia from "elysia";
import { authServiceProvider } from "./provider";
import { authUserSchema } from "@/resources/users/model";
import { handleValidationErrors } from "@/shared/errors/validation";
import {
  handleSignUpErrors,
  handleAuthSuccess,
  handleSignInErrors,
} from "./responses";
import { pipe, TE } from "@/shared/fp-ts";

export const auth = new Elysia()
  .use(authServiceProvider())
  .use(handleValidationErrors)
  .group("/auth", (group) =>
    group
      .post(
        "/sign-up",
        ({ authService, ...context }) =>
          pipe(
            authService.signUp(context),
            TE.fold(handleSignUpErrors, handleAuthSuccess),
          ),
        { body: authUserSchema },
      )
      .post(
        "/sign-in",
        ({ authService, ...context }) =>
          pipe(
            authService.signIn(context),
            TE.fold(handleSignInErrors, handleAuthSuccess),
          ),
        {
          body: authUserSchema,
        },
      ),
  );
