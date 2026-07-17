CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(32) NOT NULL,
	"form_type" varchar(32) NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"email" varchar(254),
	"phone" varchar(40),
	"subject" varchar(160),
	"message" text,
	"vehicle_id" varchar(80),
	"payload" jsonb,
	"consent" boolean DEFAULT false NOT NULL,
	"consent_text_version" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_form_type_idx" ON "leads" USING btree ("form_type");