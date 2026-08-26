import { db } from "@/lib/db";
import {
  customers,
  bookings,
  bookingItems,
  settings,
  items,
  bookingStatusLog,
} from "@/db/schema";
import { eq } from "drizzle-orm";
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

  const code = `YS-${b.id}-${new Date().getFullYear()}`;
  return { code, total, dp, remaining };
}
