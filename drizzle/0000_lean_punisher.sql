CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(25) NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
