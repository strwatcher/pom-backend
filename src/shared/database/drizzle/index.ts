import Elysia from "elysia";
import { db } from "./connection";

export * from "./connection";

export const databaseProvider = () => new Elysia().decorate("database", db);
