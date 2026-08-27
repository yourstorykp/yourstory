import { db } from "@/lib/db";
import {
  customers,
  bookings,
  bookingItems,
  settings,
  items,
  bookingStatusLog,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getItemAvailability, hasConflict } from "@/lib/availability";

export type BookingInput = {
  itemId: number;
  name: string;
  contact: string;
  email?: string;
  startDate: string;
  endDate: string;
  qty?: number;
  notes?: string;
};

export type BookingResult = {
  code: string;
  total: number;
  dp: number;
  remaining: number;
};

export function bookingDisplayCode(b: {
  id: number;
  kode: string | null;
  createdAt: Date | string | null;
}): string {
  if (b.kode) return b.kode;
  const y = b.createdAt ? new Date(b.createdAt).getFullYear() : new Date().getFullYear();
  return `YS-${b.id}-${y}`;
}

export async function buildBookingCode(
  name: string,
  startDate: string,
  id: number,
): Promise<string> {
  const day = Number(String(startDate).slice(8, 10)) || new Date().getDate();
  const base =
    (name.trim().split(/\s+/)[0] || "SEWA")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12) || "SEWA";
  const candidate = `${base}${day}`;
  const clash = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.kode, candidate))
    .limit(1);
  return clash.length ? `${base}${day}${id}` : candidate;
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const { itemId, name, contact, email, startDate, endDate, notes } = input;
  const qty = Math.max(1, Number(input.qty) || 1);

  const [item] = await db.select().from(items).where(eq(items.id, itemId));
  if (!item) throw new Error("Barang tidak ditemukan.");
  if (qty > item.stokTotal) {
    throw new Error(`Stok tersedia hanya ${item.stokTotal} unit.`);
  }

  const { stokTotal, ranges } = await getItemAvailability(itemId);
  if (hasConflict(stokTotal, ranges, startDate, endDate, qty)) {
    throw new Error(
      "Maaf, stok tidak tersedia pada tanggal yang dipilih. Coba periode lain.",
    );
  }

  const days = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
    ) + 1,
  );
  const price = Number(item.hargaSewa) || 0;
  const total = days * qty * price;

  const s = await db.select().from(settings).limit(1);
  const dpPct = Number(s[0]?.defaultDpPct ?? 30);
  const dp = Math.round((total * dpPct) / 100);
  const remaining = total - dp;

  let customerId: number;
  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.contact, contact))
    .limit(1);
  if (existing.length) {
    customerId = existing[0].id;
  } else {
    const [c] = await db
      .insert(customers)
      .values({ name, contact, email, notes: "" })
      .returning({ id: customers.id });
    customerId = c.id;
  }

  const [b] = await db
    .insert(bookings)
    .values({
      customerId,
      startDate,
      endDate,
      total: String(total),
      dpAmount: String(dp),
      remaining: String(remaining),
      status: "booking",
      notes,
    })
    .returning({ id: bookings.id });

  await db
    .insert(bookingStatusLog)
    .values({ bookingId: b.id, status: "booking" });

  await db.insert(bookingItems).values({
    bookingId: b.id,
    itemId,
    qty,
    price: String(price),
    subtotal: String(days * qty * price),
    maintenanceDays: item.maintenanceDays,
  });

  const code = await buildBookingCode(name, startDate, b.id);
  await db.update(bookings).set({ kode: code }).where(eq(bookings.id, b.id));
  return { code, total, dp, remaining };
}

export type MultiBookingItem = { itemId: number; qty: number };

export type MultiBookingInput = {
  items: MultiBookingItem[];
  name: string;
  contact: string;
  email?: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

export async function createBookingMulti(
  input: MultiBookingInput,
): Promise<BookingResult> {
  const { name, contact, email, startDate, endDate, notes } = input;

  if (!input.items.length) throw new Error("Keranjang kosong.");
  if (!startDate || !endDate) {
    throw new Error("Tanggal sewa dan tanggal kembali wajib diisi.");
  }
  if (new Date(endDate) < new Date(startDate)) {
    throw new Error("Tanggal kembali tidak boleh sebelum tanggal sewa.");
  }

  const days = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
    ) + 1,
  );

  const ids = input.items.map((i) => i.itemId);
  const allItems = await db.select().from(items).where(inArray(items.id, ids));
  const byId = new Map(allItems.map((i) => [i.id, i]));

  let total = 0;
  const lines: {
    itemId: number;
    qty: number;
    price: number;
    subtotal: number;
    maintenanceDays: number;
  }[] = [];

  for (const { itemId, qty } of input.items) {
    const item = byId.get(itemId);
    if (!item) throw new Error("Ada barang yang tidak valid.");
    const q = Math.max(1, qty);
    if (q > item.stokTotal) {
      throw new Error(`Stok ${item.name} hanya ${item.stokTotal} unit.`);
    }
    const { stokTotal, ranges } = await getItemAvailability(itemId);
    if (hasConflict(stokTotal, ranges, startDate, endDate, q)) {
      throw new Error(
        `Maaf, stok ${item.name} tidak tersedia pada tanggal yang dipilih.`,
      );
    }
    const price = Number(item.hargaSewa) || 0;
    const subtotal = days * q * price;
    total += subtotal;
    lines.push({
      itemId,
      qty: q,
      price,
      subtotal,
      maintenanceDays: item.maintenanceDays,
    });
  }

  const s = await db.select().from(settings).limit(1);
  const dpPct = Number(s[0]?.defaultDpPct ?? 30);
  const dp = Math.round((total * dpPct) / 100);
  const remaining = total - dp;

  let customerId: number;
  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.contact, contact))
    .limit(1);
  if (existing.length) {
    customerId = existing[0].id;
  } else {
    const [c] = await db
      .insert(customers)
      .values({ name, contact, email, notes: "" })
      .returning({ id: customers.id });
    customerId = c.id;
  }

  const [b] = await db
    .insert(bookings)
    .values({
      customerId,
      startDate,
      endDate,
      total: String(total),
      dpAmount: String(dp),
      remaining: String(remaining),
      status: "booking",
      notes,
    })
    .returning({ id: bookings.id });

  await db
    .insert(bookingStatusLog)
    .values({ bookingId: b.id, status: "booking" });

  await db.insert(bookingItems).values(
    lines.map((l) => ({
      bookingId: b.id,
      itemId: l.itemId,
      qty: l.qty,
      price: String(l.price),
      subtotal: String(l.subtotal),
      maintenanceDays: l.maintenanceDays,
    })),
  );

  const code = await buildBookingCode(name, startDate, b.id);
  await db.update(bookings).set({ kode: code }).where(eq(bookings.id, b.id));
  return { code, total, dp, remaining };
}
