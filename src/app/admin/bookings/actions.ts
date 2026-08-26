"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  bookings,
  payments,
  customers,
  items,
  bookingItems,
  settings,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseNum, parseText } from "@/lib/format";
import { getItemAvailability, hasConflict } from "@/lib/availability";

const ALLOWED = [
  "booking",
  "confirmed",
  "active",
  "returned",
  "completed",
  "cancelled",
  "late",
];

export async function updateBookingStatusAction(
  bookingId: number,
  status: string,
  _fd?: FormData,
): Promise<void> {
  if (!ALLOWED.includes(status)) return;
  try {
    await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, bookingId));
  } catch (e) {
    console.error("updateBookingStatusAction:", e);
  }
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
}

export async function markDpPaidAction(
  bookingId: number,
  _fd?: FormData,
): Promise<void> {
  try {
    await db.update(bookings).set({ dpPaid: true }).where(eq(bookings.id, bookingId));
  } catch (e) {
    console.error("markDpPaidAction:", e);
  }
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
}

export async function addPaymentAction(formData: FormData): Promise<void> {
  const bookingId = Number(formData.get("bookingId"));
  const type = parseText(formData.get("type")) || "remaining";
  const amount = parseNum(formData.get("amount"));
  const method = parseText(formData.get("method")) || null;
  const note = parseText(formData.get("note")) || null;
  if (!bookingId || !(Number(amount) > 0)) return;
  try {
    await db.insert(payments).values({ bookingId, type, amount, method, note });
  } catch (e) {
    console.error("addPaymentAction:", e);
  }
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
}

export type AdminBookingState = {
  error?: string;
};

export async function adminCreateBookingAction(
  _prev: AdminBookingState,
  formData: FormData,
): Promise<AdminBookingState> {
  const startDate = parseText(formData.get("startDate"));
  const endDate = parseText(formData.get("endDate"));
  const notes = parseText(formData.get("notes"));
  const customerMode = parseText(formData.get("customerMode")) || "existing";
  const customerIdRaw = Number(formData.get("customerId"));
  const name = parseText(formData.get("name"));
  const contact = parseText(formData.get("contact"));
  const email = parseText(formData.get("email")) || null;

  if (!startDate || !endDate) {
    return { error: "Tanggal sewa dan tanggal kembali wajib diisi." };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { error: "Tanggal kembali tidak boleh sebelum tanggal sewa." };
  }

  let customerId: number;
  if (customerMode === "existing") {
    if (!customerIdRaw) return { error: "Pilih pelanggan terlebih dahulu." };
    customerId = customerIdRaw;
  } else {
    if (!name || !contact) {
      return { error: "Nama dan kontak pelanggan wajib diisi." };
    }
    const [c] = await db
      .insert(customers)
      .values({ name, contact, email, notes: "" })
      .returning({ id: customers.id });
    customerId = c.id;
  }

  const rawIds = formData.getAll("itemId").map(Number);
  const rawQtys = formData.getAll("qty").map((v) => Math.max(1, Number(v) || 1));
  const pairs = rawIds
    .map((id, i) => ({ id, qty: rawQtys[i] ?? 1 }))
    .filter((p) => p.id > 0);
  if (pairs.length === 0) {
    return { error: "Pilih minimal satu barang." };
  }
  const itemIds = pairs.map((p) => p.id);
  const qtys = pairs.map((p) => p.qty);

  const days = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
    ) + 1,
  );

  const allItems = await db.select().from(items);
  const byId = new Map(allItems.map((it) => [it.id, it]));

  const lines: { itemId: number; qty: number; price: number; subtotal: number }[] =
    [];
  let total = 0;
  for (let i = 0; i < itemIds.length; i++) {
    const itemId = itemIds[i];
    const qty = qtys[i] ?? 1;
    const item = byId.get(itemId);
    if (!item) return { error: "Ada barang yang tidak valid." };
    if (qty > item.stokTotal) {
      return { error: `Stok ${item.name} hanya ${item.stokTotal} unit.` };
    }
    const { stokTotal, ranges } = await getItemAvailability(itemId);
    if (hasConflict(stokTotal, ranges, startDate, endDate, qty)) {
      return {
        error: `Stok ${item.name} tidak tersedia pada tanggal terpilih.`,
      };
    }
    const price = Number(item.hargaSewa) || 0;
    const subtotal = days * qty * price;
    total += subtotal;
    lines.push({ itemId, qty, price, subtotal });
  }

  const s = await db.select().from(settings).limit(1);
  const dpPct = Number(s[0]?.defaultDpPct ?? 30);
  const dp = Math.round((total * dpPct) / 100);
  const remaining = total - dp;

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

  await db.insert(bookingItems).values(
    lines.map((l) => ({
      bookingId: b.id,
      itemId: l.itemId,
      qty: l.qty,
      price: String(l.price),
      subtotal: String(l.subtotal),
      maintenanceDays: byId.get(l.itemId)?.maintenanceDays ?? 0,
    })),
  );

  revalidatePath("/admin/bookings");
  redirect(`/admin/bookings/${b.id}`);
}
