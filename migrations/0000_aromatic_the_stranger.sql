CREATE TABLE IF NOT EXISTS "message" (
	"id" serial PRIMARY KEY NOT NULL,
	"dId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"channel" varchar NOT NULL,
	"guild" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"dId" varchar NOT NULL,
	"emoji" varchar NOT NULL,
	"guild" varchar NOT NULL
);
