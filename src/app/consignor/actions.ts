"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { bookingItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function setConsignorPaidAction(
  bookingItemId: number,
  paid: boolean
): Promise<{ success: boolean }> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Hanya admin yang dapat menandai lunas.");
  }
  await db
    .update(bookingItems)
    .set({ consignorPaid: paid })
    .where(eq(bookingItems.id, bookingItemId));
  revalidatePath("/consignor");
  revalidatePath("/admin/titip-sewa");
  return { success: true };
}
