import { db } from "@/lib/db";
import { items, bookingItems, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function getItemAvailability(itemId: number): Promise<{
  stokTotal: number;
  ranges: BookedRange[];
}> {
  const [item] = await db.select().from(items).where(eq(items.id, itemId));
  if (!item) return { stokTotal: 0, ranges: [] };

  const bis = await db.query.bookingItems.findMany({
    where: eq(bookingItems.itemId, itemId),
    with: { booking: true },
  });

  const ranges: BookedRange[] = bis
    .filter(
      (bi) =>
        bi.booking &&
        ["active", "returned", "late"].includes(bi.booking.status),
    )
    .map((bi) => ({
      start: bi.booking!.startDate,
      end: addDays(bi.booking!.endDate, bi.maintenanceDays),
      qty: bi.qty,
    }));

  return { stokTotal: item.stokTotal, ranges };
}

export function hasConflict(
  stokTotal: number,
  ranges: BookedRange[],
  start: string,
  end: string,
  qty: number,
): boolean {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = iso(d);
    let booked = 0;
    for (const r of ranges) {
      if (day >= r.start && day <= r.end) booked += r.qty;
    }
    if (stokTotal - booked < qty) return true;
  }
  return false;
}
