import { db } from "@/lib/db";
import { items, bookingItems, bookings } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";

export type BookedRange = {
  start: string;
  end: string;
  qty: number;
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

export async function getMultipleItemsAvailability(
  itemIds: number[]
): Promise<Record<number, { stokTotal: number; ranges: BookedRange[] }>> {
  if (itemIds.length === 0) return {};

  const itemsList = await db.select().from(items).where(inArray(items.id, itemIds));
  const itemsMap: Record<number, { stokTotal: number; ranges: BookedRange[] }> = {};
  
  for (const it of itemsList) {
    itemsMap[it.id] = { stokTotal: it.stokTotal, ranges: [] };
  }

  const bis = await db
    .select({
      itemId: bookingItems.itemId,
      qty: bookingItems.qty,
      maintenanceDays: bookingItems.maintenanceDays,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
    })
    .from(bookingItems)
    .innerJoin(bookings, eq(bookingItems.bookingId, bookings.id))
    .where(
      and(
        inArray(bookingItems.itemId, itemIds),
        inArray(bookings.status, ["booking", "confirmed", "active", "returned", "late"])
      )
    );

  for (const bi of bis) {
    if (!bi.itemId || !itemsMap[bi.itemId]) continue;
    itemsMap[bi.itemId].ranges.push({
      start: bi.startDate,
      end: addDays(bi.endDate, bi.maintenanceDays),
      qty: bi.qty,
    });
  }

  return itemsMap;
}

export async function getItemAvailability(itemId: number): Promise<{
  stokTotal: number;
  ranges: BookedRange[];
}> {
  const map = await getMultipleItemsAvailability([itemId]);
  return map[itemId] || { stokTotal: 0, ranges: [] };
}

export function hasConflict(
  stokTotal: number,
  ranges: BookedRange[],
  start: string,
  end: string,
  qty: number,
): boolean {
  if (qty > stokTotal) return true;
  
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = iso(d);
    let booked = 0;
    for (const r of ranges) {
      if (day >= r.start && day <= r.end) booked += r.qty;
    }
    if (booked + qty > stokTotal) return true;
  }
  return false;
}
