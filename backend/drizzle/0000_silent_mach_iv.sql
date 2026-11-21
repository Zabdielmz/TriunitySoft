CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"name_enc" text NOT NULL,
	"email_enc" text NOT NULL,
	"message_enc" text NOT NULL,
	"email_hash" text NOT NULL,
	"ip_hash" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"ip_hash" text NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notify_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notify_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "contact_submissions_email_hash_created_at_idx" ON "contact_submissions" USING btree ("email_hash","created_at");--> statement-breakpoint
CREATE INDEX "contact_submissions_ip_hash_created_at_idx" ON "contact_submissions" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_ip_hash_attempted_at_idx" ON "login_attempts" USING btree ("ip_hash","attempted_at");