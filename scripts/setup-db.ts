import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const statements = [
  `CREATE TABLE IF NOT EXISTS categories (
    id serial PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS consignors (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    contact text,
    notes text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS items (
    id serial PRIMARY KEY,
    category_id integer REFERENCES categories(id),
    name text NOT NULL,
    sku text,
    description text,
    harga_sewa numeric(12,2) NOT NULL DEFAULT 0,
    satuan_sewa text NOT NULL DEFAULT 'hari',
    stok_total integer NOT NULL DEFAULT 1,
    maintenance_days integer NOT NULL DEFAULT 0,
    owner_type text NOT NULL DEFAULT 'store',
    consignor_id integer REFERENCES consignors(id),
    profit_share_pct numeric(5,2) NOT NULL DEFAULT 0,
    foto_url text,
    notes text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    id serial PRIMARY KEY,
    store_name text NOT NULL DEFAULT 'yourstory.kp',
    currency text NOT NULL DEFAULT 'IDR',
    default_dp_pct numeric(5,2) NOT NULL DEFAULT 30,
    late_fee_rule text,
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS customers (
    id serial PRIMARY KEY,
    name text NOT NULL,
    contact text,
    email text,
    notes text,
    blacklist boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id serial PRIMARY KEY,
    customer_id integer REFERENCES customers(id),
    start_date date NOT NULL,
    end_date date NOT NULL,
    total numeric(12,2) NOT NULL DEFAULT 0,
    dp_amount numeric(12,2) NOT NULL DEFAULT 0,
    dp_paid boolean NOT NULL DEFAULT false,
    remaining numeric(12,2) NOT NULL DEFAULT 0,
    deposit_type text NOT NULL DEFAULT 'ktp',
    deposit_received boolean NOT NULL DEFAULT false,
    deposit_returned boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'booking',
    notes text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS booking_items (
    id serial PRIMARY KEY,
    booking_id integer REFERENCES bookings(id),
    item_id integer REFERENCES items(id),
    qty integer NOT NULL DEFAULT 1,
    price numeric(12,2) NOT NULL DEFAULT 0,
    subtotal numeric(12,2) NOT NULL DEFAULT 0,
    maintenance_days integer NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id serial PRIMARY KEY,
    booking_id integer REFERENCES bookings(id),
    type text NOT NULL DEFAULT 'dp',
    amount numeric(12,2) NOT NULL DEFAULT 0,
    method text,
    paid_at timestamp DEFAULT now(),
    note text
  )`,
  `CREATE TABLE IF NOT EXISTS documents (
    id serial PRIMARY KEY,
    booking_id integer REFERENCES bookings(id),
    type text NOT NULL DEFAULT 'ktp',
    url text NOT NULL
  )`,
];

async function main() {
  for (const s of statements) {
    await sql.query(s);
    console.log("✓", s.slice(0, 38).replace(/\s+/g, " "));
  }
  console.log("Semua tabel siap.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Gagal:", e);
  process.exit(1);
});
