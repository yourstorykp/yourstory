import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatRupiah, formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  booking: "Menunggu",
  confirmed: "Dikonfirmasi",
  active: "Disewa",
  returned: "Kembali",
  completed: "Selesai",
  cancelled: "Batal",
  late: "Terlambat",
};

function defaultRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  return { from, to };
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } =
    sp.from && sp.to ? { from: sp.from, to: sp.to } : defaultRange();

  const all = await db.query.bookings.findMany({
    with: { customer: true, payments: true },
    orderBy: (b, { desc }) => [desc(b.startDate)],
  });

  const rows = all.filter((b) => b.startDate <= to && b.endDate >= from);

  let omzet = 0;
  let dpMasuk = 0;
  let piutang = 0;
  let denda = 0;
  let aktif = 0;
  for (const b of rows) {
    const total = Number(b.total) || 0;
    const paid = (b.payments || []).reduce(
      (s, p) => s + (Number(p.amount) || 0),
      0,
    );
    const sisa = Math.max(0, total - paid);
    omzet += total;
    if (b.dpPaid) dpMasuk += Number(b.dpAmount) || 0;
    if (b.status !== "completed" && b.status !== "cancelled") piutang += sisa;
    denda += (b.payments || [])
      .filter((p) => p.type === "denda")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    if (b.status === "active" || b.status === "late") aktif += 1;
  }

  const kpis = [
    { label: "Jumlah Booking", value: String(rows.length) },
    { label: "Omzet (total sewa)", value: formatRupiah(omzet) },
    { label: "DP Masuk", value: formatRupiah(dpMasuk) },
    { label: "Piutang", value: formatRupiah(piutang) },
    { label: "Denda", value: formatRupiah(denda) },
    { label: "Booking Aktif", value: String(aktif) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Laporan</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan booking berdasarkan periode sewa.
          </p>
        </div>
        <Link href={`/admin/laporan/export?from=${from}&to=${to}`}>
          <Button variant="outline">Export CSV</Button>
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Dari</label>
          <input
            name="from"
            type="date"
            defaultValue={from}
            className="h-9 rounded-lg border border-input bg-card px-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Sampai</label>
          <input
            name="to"
            type="date"
            defaultValue={to}
            className="h-9 rounded-lg border border-input bg-card px-2 text-sm"
          />
        </div>
        <Button type="submit" className="bg-forest hover:bg-forest-deep">
          Tampilkan
        </Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-1 font-heading text-xl font-semibold">
              {k.value}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-2">Kode</th>
              <th className="px-3 py-2">Pelanggan</th>
              <th className="px-3 py-2">Periode</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Dibayar</th>
              <th className="px-3 py-2 text-right">Sisa</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  Tidak ada booking pada periode ini.
                </td>
              </tr>
            ) : (
              rows.map((b) => {
                const total = Number(b.total) || 0;
                const paid = (b.payments || []).reduce(
                  (s, p) => s + (Number(p.amount) || 0),
                  0,
                );
                const sisa = Math.max(0, total - paid);
                return (
                  <tr
                    key={b.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-forest-deep hover:underline"
                      >
                        YS-{b.id}-{new Date(b.createdAt).getFullYear()}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{b.customer?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                       {formatTanggal(b.startDate)} → {formatTanggal(b.endDate)}
                    </td>
                    <td className="px-3 py-2">
                      {statusLabel[b.status] ?? b.status}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatRupiah(total)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatRupiah(paid)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatRupiah(sisa)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
