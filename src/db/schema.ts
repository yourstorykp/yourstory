import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consignors = pgTable("consignors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  contact: text("contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  sku: text("sku"),
  description: text("description"),
  hargaSewa: numeric("harga_sewa", { precision: 12, scale: 2 }).notNull().default("0"),
  satuanSewa: text("satuan_sewa").notNull().default("hari"),
  stokTotal: integer("stok_total").notNull().default(1),
  maintenanceDays: integer("maintenance_days").notNull().default(0),
  ownerType: text("owner_type").notNull().default("store"),
  consignorId: integer("consignor_id").references(() => consignors.id),
  profitSharePct: numeric("profit_share_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  fotoUrl: text("foto_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("yourstory.kp"),
  currency: text("currency").notNull().default("IDR"),
  defaultDpPct: numeric("default_dp_pct", { precision: 5, scale: 2 }).notNull().default("30"),
  lateFeeRule: text("late_fee_rule"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  email: text("email"),
  notes: text("notes"),
  blacklist: boolean("blacklist").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  dpAmount: numeric("dp_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  dpPaid: boolean("dp_paid").notNull().default(false),
  remaining: numeric("remaining", { precision: 12, scale: 2 }).notNull().default("0"),
  depositType: text("deposit_type").notNull().default("ktp"),
  depositReceived: boolean("deposit_received").notNull().default(false),
  depositReturned: boolean("deposit_returned").notNull().default(false),
  status: text("status").notNull().default("booking"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookingItems = pgTable("booking_items", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  itemId: integer("item_id").references(() => items.id),
  qty: integer("qty").notNull().default(1),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  maintenanceDays: integer("maintenance_days").notNull().default(0),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  type: text("type").notNull().default("dp"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  method: text("method"),
  paidAt: timestamp("paid_at").defaultNow(),
  note: text("note"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  type: text("type").notNull().default("ktp"),
  url: text("url").notNull(),
});

export const bookingStatusLog = pgTable("booking_status_log", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  status: text("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  consignor: one(consignors, {
    fields: [items.consignorId],
    references: [consignors.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const consignorsRelations = relations(consignors, ({ many }) => ({
  items: many(items),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  items: many(bookingItems),
  payments: many(payments),
  documents: many(documents),
  statusLog: many(bookingStatusLog),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
  item: one(items, {
    fields: [bookingItems.itemId],
    references: [items.id],
  }),
}));
