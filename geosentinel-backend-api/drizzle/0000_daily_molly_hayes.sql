CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"phone_verification_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE INDEX "user_phone_number_idx" ON "user" USING btree ("phone_number");