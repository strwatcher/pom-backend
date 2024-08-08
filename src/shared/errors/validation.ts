import Elysia from "elysia";
import { A, pipe } from "@/shared/fp-ts";

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
