CREATE TYPE "public"."body_style" AS ENUM('sedan', 'suv', 'coupe', 'convertible', 'hatchback', 'truck');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('available', 'reserved', 'sold');--> statement-breakpoint
CREATE TYPE "public"."mileage_unit" AS ENUM('mi', 'km');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" varchar(160) NOT NULL,
	"summary" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_media_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requested_by" text NOT NULL,
	"vehicle_id" varchar(80),
	"object_key" text NOT NULL,
	"expected_mime_type" varchar(100) NOT NULL,
	"expected_byte_size" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"finalized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pending_media_byte_size_check" CHECK ("pending_media_uploads"."expected_byte_size" > 0)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" varchar(16) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"name" varchar(120) NOT NULL,
	"short_name" varchar(80) NOT NULL,
	"logo_url" text NOT NULL,
	"favicon_url" text,
	"phone_display" varchar(40) NOT NULL,
	"phone_href" varchar(64) NOT NULL,
	"email" varchar(254),
	"address_line_1" varchar(180),
	"address_line_2" varchar(180),
	"hours" jsonb NOT NULL,
	"map_url" text,
	"social_links" jsonb NOT NULL,
	"description" text NOT NULL,
	"home" jsonb NOT NULL,
	"financing_introduction" text NOT NULL,
	"contact_introduction" text NOT NULL,
	"consent_text" text,
	"consent_text_version" varchar(32),
	"seo" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton_check" CHECK ("site_settings"."id" = 'default')
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "staff_role" DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" varchar(80) NOT NULL,
	"object_key" text,
	"source_url" text,
	"original_filename" varchar(255),
	"mime_type" varchar(100) NOT NULL,
	"byte_size" integer,
	"width" integer,
	"height" integer,
	"alt_text" varchar(300) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_images_source_check" CHECK (("vehicle_images"."object_key" is not null) <> ("vehicle_images"."source_url" is not null)),
	CONSTRAINT "vehicle_images_byte_size_check" CHECK ("vehicle_images"."byte_size" is null or "vehicle_images"."byte_size" > 0)
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"inventory_status" "inventory_status" DEFAULT 'available' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"year" integer NOT NULL,
	"make" varchar(80) NOT NULL,
	"model" varchar(100) NOT NULL,
	"trim" varchar(120) NOT NULL,
	"body_style" "body_style" NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"mileage" integer NOT NULL,
	"mileage_unit" "mileage_unit" DEFAULT 'mi' NOT NULL,
	"fuel" varchar(80) NOT NULL,
	"engine" varchar(120) NOT NULL,
	"drivetrain" varchar(80) NOT NULL,
	"transmission" varchar(100) NOT NULL,
	"exterior" varchar(120) NOT NULL,
	"interior" varchar(120) NOT NULL,
	"vin" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "vehicles_year_check" CHECK ("vehicles"."year" between 1886 and 2100),
	CONSTRAINT "vehicles_price_check" CHECK ("vehicles"."price" >= 0),
	CONSTRAINT "vehicles_mileage_check" CHECK ("vehicles"."mileage" >= 0)
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "vehicle_display_name" varchar(240);--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "admin_audit_events_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_media_uploads" ADD CONSTRAINT "pending_media_uploads_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_media_uploads" ADD CONSTRAINT "pending_media_uploads_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_unique" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "admin_audit_entity_idx" ON "admin_audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "admin_audit_created_at_idx" ON "admin_audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pending_media_object_key_unique" ON "pending_media_uploads" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "pending_media_expiry_idx" ON "pending_media_uploads" USING btree ("expires_at","finalized_at");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_unique" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_images_vehicle_order_unique" ON "vehicle_images" USING btree ("vehicle_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_images_object_key_unique" ON "vehicle_images" USING btree ("object_key");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_slug_unique" ON "vehicles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "vehicles_public_inventory_idx" ON "vehicles" USING btree ("publication_status","inventory_status");--> statement-breakpoint
CREATE INDEX "vehicles_featured_idx" ON "vehicles" USING btree ("publication_status","featured");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "leads_reference_idx" ON "leads" USING btree ("reference");