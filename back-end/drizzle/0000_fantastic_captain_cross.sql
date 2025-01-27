CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"total_emails" integer NOT NULL,
	"processed" integer NOT NULL,
	"status" text NOT NULL
);
