import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { desc, ne, count } from "drizzle-orm";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookingsList } from "@/components/admin/bookings-list";
import { bookingDisplayCode } from "@/lib/booking";

export const dynamic = "force-dynamic";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const pageSize = 15;

  const [[totalCount], rows] = await Promise.all([
    db.select({ v: count() }).from(bookings).where(ne(bookings.status, "completed")),
    db.query.bookings.findMany({
      where: ne(bookings.status, "completed"),
      with: { customer: true, items: { with: { item: true } } },
      orderBy: [desc(bookings.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
  ]);
  const totalPages = Math.ceil(totalCount.v / pageSize);

  const data = rows.map((b) => ({
    code: bookingDisplayCode(b),
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
      <PaginationControls page={page} totalPages={totalPages} baseUrl="/admin/bookings" />
    </div>
  );
}
