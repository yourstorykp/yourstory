import Link from "next/link";
import { db } from "@/lib/db";
import { items, categories, consignors, settings, bookings } from "@/db/schema";
import { count, sql, eq, notInArray, desc } from "drizzle-orm";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [itemCount, catCount, consCount, s, revAgg, piuAgg, activeC, lateC, recent] =
    await Promise.all([
      db.select({ v: count() }).from(items),
      db.select({ v: count() }).from(categories),
      db.select({ v: count() }).from(consignors),
      db.select().from(settings).limit(1),
      db.select({ sum: sql`coalesce(sum(${bookings.total}),0)` }).from(bookings),
      db
        .select({ sum: sql`coalesce(sum(${bookings.remaining}),0)` })
        .from(bookings)
        .where(notInArray(bookings.status, ["cancelled", "completed"])),
      db.select({ v: count() }).from(bookings).where(eq(bookings.status, "active")),
      db.select({ v: count() }).from(bookings).where(eq(bookings.status, "late")),
      db.query.bookings.findMany({
        orderBy: [desc(bookings.createdAt)],
        limit: 5,
        with: { customer: true },
      }),
    ]);

  const storeName = s[0]?.storeName ?? "yourstory.kp";
  const omzet = Number(revAgg[0]?.sum ?? 0);
  const piutang = Number(piuAgg[0]?.sum ?? 0);

  const kpis = [
    { label: "Total Barang", value: String(itemCount[0]?.v ?? 0) },
    { label: "Booking Aktif", value: String(activeC[0]?.v ?? 0) },
    { label: "Terlambat", value: String(lateC[0]?.v ?? 0), danger: true },
    { label: "Omzet", value: formatRupiah(String(omzet)) },
    { label: "Piutang", value: formatRupiah(String(piutang)) },
    { label: "Pemilik Titipan", value: String(consCount[0]?.v ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Selamat datang di</p>
        <h1 className="font-heading text-3xl font-semibold text-forest-deep">
          {storeName}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p
                className={`font-heading text-2xl font-semibold ${k.danger ? "text-red-600" : "text-forest"}`}
              >
                {k.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/admin/bookings" />} className="bg-forest hover:bg-forest-deep">
          Lihat Booking
        </Button>
        <Button render={<Link href="/admin/items/new" />} variant="outline">
          + Tambah Barang
        </Button>
        <Button render={<Link href="/admin/customers" />} variant="outline">
          Pelanggan
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-heading text-lg font-semibold">Booking Terbaru</h2>
        </div>
        <ul className="divide-y divide-border/60">
          {recent.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada booking.
            </li>
          )}
          {recent.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="font-medium text-forest-deep hover:underline"
                >
                  YS-{b.id}-{new Date(b.createdAt).getFullYear()}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {b.customer?.name ?? "?"} · {b.startDate} s.d. {b.endDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{formatRupiah(b.total)}</span>
                <span className="text-xs text-muted-foreground">{b.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
