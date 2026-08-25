"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { bookings, payments, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseNum, parseText } from "@/lib/format";

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

export async function addDocumentAction(formData: FormData): Promise<void> {
  const bookingId = Number(formData.get("bookingId"));
  const type = parseText(formData.get("type")) || "ktp";
  const url = parseText(formData.get("url"));
  if (!bookingId || !url) return;
  try {
    await db.insert(documents).values({ bookingId, type, url });
  } catch (e) {
    console.error("addDocumentAction:", e);
  }
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
}
