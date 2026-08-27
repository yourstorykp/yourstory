import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/admin/print-button";
import { db } from "@/lib/db";
import { bookings, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { bookingDisplayCode } from "@/lib/booking";
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookingId = Number(id);
  if (Number.isNaN(bookingId)) notFound();

  const [b] = await db.query.bookings.findMany({
    where: eq(bookings.id, bookingId),
    with: { customer: true, items: { with: { item: true } }, payments: true },
    limit: 1,
  });
  if (!b) notFound();

  const total = Number(b.total) || 0;
  const dp = Number(b.dpAmount) || 0;
  const totalPaid = (b.payments || []).reduce(
    (s, p) => s + (Number(p.amount) || 0),
    0,
  );
  const sisa = Math.max(0, total - totalPaid);
  const days = Math.max(
    1,
    Math.round(
      (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) /
        86400000,
    ) + 1,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/admin/bookings/${b.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Kembali
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-border bg-white p-8 text-foreground">
        <header className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="font-heading text-2xl font-bold text-forest-deep">
              yourstory<span className="text-terracotta">.kp</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Sistem manajemen rental
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-heading text-lg font-semibold">
              BUKTI SEWA
            </div>
            <div className="text-muted-foreground">
              No: {bookingDisplayCode(b)}
            </div>
            <div className="text-muted-foreground">
              {formatTanggal(new Date())}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 py-4 text-sm">
          <div>
            <div className="text-muted-foreground">Pelanggan</div>
            <div className="font-medium">{b.customer?.name ?? "—"}</div>
            <div>{b.customer?.contact ?? ""}</div>
            {b.customer?.email && (
              <div className="text-muted-foreground">{b.customer.email}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Periode Sewa</div>
            <div className="font-medium">
              {formatTanggal(b.startDate)} s.d. {formatTanggal(b.endDate)}
            </div>
            <div>
              {days} hari · Status: {statusLabel[b.status] ?? b.status}
            </div>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-left text-muted-foreground">
              <th className="py-2">Barang</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {b.items.map((bi) => (
              <tr key={bi.id} className="border-b border-border/60">
                <td className="py-2">{bi.item?.name ?? "?"}</td>
                <td className="py-2 text-right">{bi.qty}</td>
                <td className="py-2 text-right">
                  {formatRupiah(bi.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <Row label="Total Sewa" value={formatRupiah(total)} />
            <Row
              label={`DP (${b.dpPaid ? "lunas" : "belum lunas"})`}
              value={formatRupiah(dp)}
            />
            <Row label="Sisa Tagihan" value={formatRupiah(sisa)} />
            <Row label="Total Dibayar" value={formatRupiah(totalPaid)} />
          </div>
        </div>

        {b.notes && (
          <div className="mt-4 border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Catatan: </span>
            {b.notes}
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
          <div className="border-t border-border pt-2 text-center text-muted-foreground">
            Penyewa
          </div>
          <div className="border-t border-border pt-2 text-center text-muted-foreground">
            Petugas yourstory.kp
          </div>
        </div>
      </div>
    </div>
  );
}
