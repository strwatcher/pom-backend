import Elysia from "elysia";
import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/Array";

export const handleValidationErrors = new Elysia().onError(
  { as: "global" },
  ({ error, code }) => {
    if (code === "VALIDATION") {
      return Response.json(
        {
          error: pipe(
            error.all,
            A.map(({ summary }) => summary),
          ),
        },
        { status: 400 },
      );
    }
  },
);
