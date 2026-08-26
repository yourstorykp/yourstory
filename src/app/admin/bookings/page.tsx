import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatRupiah } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  booking: "Menunggu",
  confirmed: "Dikonfirmasi",
  active: "Disewa",
  returned: "Kembali",
  completed: "Selesai",
  cancelled: "Batal",
};

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "cancelled"
      ? "bg-red-100 text-red-700"
      : status === "completed" || status === "returned"
        ? "bg-forest/15 text-forest-deep"
        : status === "active"
          ? "bg-terracotta/15 text-terracotta-deep"
          : "bg-amber-100 text-amber-700";
  return (
    <Badge variant="secondary" className={tone}>
      {statusLabel[status] ?? status}
    </Badge>
  );
}

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const rows = await db.query.bookings.findMany({
    with: { customer: true, items: { with: { item: true } } },
    orderBy: [desc(bookings.createdAt)],
  });

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

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Pelanggan</th>
              <th className="px-4 py-3 font-medium">Barang</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">DP</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  Belum ada booking masuk.
                </td>
              </tr>
            )}
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="text-forest-deep underline-offset-2 hover:underline"
                  >
                    YS-{b.id}-{new Date(b.createdAt).getFullYear()}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>{b.customer?.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{b.customer?.contact ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {b.items
                    .map((bi) => `${bi.item?.name ?? "?"} ×${bi.qty}`)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{b.startDate}</div>
                  <div className="text-xs">s.d. {b.endDate}</div>
                </td>
                <td className="px-4 py-3">{formatRupiah(b.total)}</td>
                <td className="px-4 py-3 text-terracotta-deep">
                  {formatRupiah(b.dpAmount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
