CREATE TABLE "booking_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"item_id" integer,
	"qty" integer DEFAULT 1 NOT NULL,
	"price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"maintenance_days" integer DEFAULT 0 NOT NULL,
	"consignor_paid" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_status_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"status" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"dp_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"dp_paid" boolean DEFAULT false NOT NULL,
	"remaining" numeric(12, 2) DEFAULT '0' NOT NULL,
	"deposit_type" text DEFAULT 'ktp' NOT NULL,
	"deposit_received" boolean DEFAULT false NOT NULL,
	"deposit_returned" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'booking' NOT NULL,
	"notes" text,
	"kode" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consignors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"contact" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consignors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text,
	"email" text,
	"notes" text,
	"blacklist" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"type" text DEFAULT 'ktp' NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"name" text NOT NULL,
	"sku" text,
	"description" text,
	"harga_sewa" numeric(12, 2) DEFAULT '0' NOT NULL,
	"satuan_sewa" text DEFAULT 'hari' NOT NULL,
	"stok_total" integer DEFAULT 1 NOT NULL,
	"maintenance_days" integer DEFAULT 0 NOT NULL,
	"owner_type" text DEFAULT 'store' NOT NULL,
	"consignor_id" integer,
	"profit_share_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
	"foto_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"type" text DEFAULT 'dp' NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"method" text,
	"paid_at" timestamp DEFAULT now(),
	"note" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_name" text DEFAULT 'yourstory.kp' NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"default_dp_pct" numeric(5, 2) DEFAULT '30' NOT NULL,
	"late_fee_rule" text,
	"background_url" text,
	"admin_whatsapp" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_status_log" ADD CONSTRAINT "booking_status_log_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_consignor_id_consignors_id_fk" FOREIGN KEY ("consignor_id") REFERENCES "public"."consignors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;