"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

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
