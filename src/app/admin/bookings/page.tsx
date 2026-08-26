import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookingsList } from "@/components/admin/bookings-list";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const rows = await db.query.bookings.findMany({
    with: { customer: true, items: { with: { item: true } } },
    orderBy: [desc(bookings.createdAt)],
  });

  const data = rows.map((b) => ({
    code: `YS-${b.id}-${new Date(b.createdAt).getFullYear()}`,
    id: b.id,
    status: b.status,
    customerName: b.customer?.name ?? null,
    contact: b.customer?.contact ?? null,
    items: b.items.map((bi) => ({ name: bi.item?.name ?? "?", qty: bi.qty })),
    startDate: b.startDate,
    endDate: b.endDate,
    total: b.total,
    dpAmount: b.dpAmount,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Booking Masuk</h1>
          <p className="text-sm text-muted-foreground">
            Pesanan dari pelanggan melalui katalog sewa.
          </p>
        </div>
        <Link href="/admin/bookings/new">
          <Button className="bg-forest hover:bg-forest-deep">
            + Booking Baru
          </Button>
        </Link>
      </div>

      <BookingsList rows={data} />
    </div>
  );
}
