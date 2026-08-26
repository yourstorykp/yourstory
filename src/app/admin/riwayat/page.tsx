import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { BookingsList } from "@/components/admin/bookings-list";

export const dynamic = "force-dynamic";

export default async function RiwayatPage() {
  const rows = await db.query.bookings.findMany({
    with: { customer: true, items: { with: { item: true } } },
    where: eq(bookings.status, "completed"),
    orderBy: [desc(bookings.endDate)],
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
      <div>
        <h1 className="font-heading text-2xl font-semibold">Riwayat Penyewaan</h1>
        <p className="text-sm text-muted-foreground">
          Pesanan yang sudah selesai.
        </p>
      </div>

      <BookingsList rows={data} />
    </div>
  );
}
