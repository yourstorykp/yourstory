"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { bookingItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function setConsignorPaidAction(
  bookingItemId: number,
  paid: boolean
): Promise<{ success: boolean }> {
  await db
    .update(bookingItems)
    .set({ consignorPaid: paid })
    .where(eq(bookingItems.id, bookingItemId));
  revalidatePath("/consignor");
  return { success: true };
}
