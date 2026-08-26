import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatRupiah } from "@/lib/format";
import { updateBookingStatusAction } from "../../actions";

export const dynamic = "force-dynamic";

const FLOW = [
  { key: "booking", label: "Pesanan Masuk" },
  { key: "confirmed", label: "Dikonfirmasi" },
  { key: "active", label: "Diserahkan" },
  { key: "returned", label: "Dikembalikan" },
  { key: "completed", label: "Selesai" },
];

const statusLabel: Record<string, string> = {
  booking: "Menunggu",
  confirmed: "Dikonfirmasi",
  active: "Disewa",
  returned: "Kembali",
  completed: "Selesai",
  cancelled: "Batal",
  late: "Terlambat",
};

function fmtDateTime(v: string | Date): string {
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AlurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookingId = Number(id);
  if (Number.isNaN(bookingId)) notFound();

  const [b] = await db.query.bookings.findMany({
    where: eq(bookings.id, bookingId),
    with: {
      customer: true,
      items: { with: { item: true } },
      payments: true,
      statusLog: true,
    },
    limit: 1,
  });
  if (!b) notFound();

  const isCancelled = b.status === "cancelled";
  const isLate = b.status === "late";
  let currentIdx = FLOW.findIndex((s) => s.key === b.status);
  if (isLate) currentIdx = FLOW.findIndex((s) => s.key === "active");

  const total = Number(b.total) || 0;
  const dp = Number(b.dpAmount) || 0;
  const totalPaid = (b.payments || []).reduce(
    (s, p) => s + (Number(p.amount) || 0),
    0,
  );
  const sisa = Math.max(0, total - totalPaid);

  const log = [...(b.statusLog || [])].sort(
    (a, c) => new Date(a.createdAt).getTime() - new Date(c.createdAt).getTime(),
  );

  const next = currentIdx >= 0 ? FLOW[currentIdx + 1] : undefined;
  const canCancel = !isCancelled && b.status !== "completed";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/admin/bookings/${b.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Kembali ke detail
          </Link>
          <h1 className="font-heading text-2xl font-semibold">
            Alur Penyewaan · YS-{b.id}-{new Date(b.createdAt).getFullYear()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {b.customer?.name ?? "—"} · {b.startDate} s.d. {b.endDate}
          </p>
        </div>
        <Link href={`/admin/bookings/${b.id}/invoice`}>
          <Button variant="outline" size="sm">
            Cetak Invoice
          </Button>
        </Link>
      </div>

      {isCancelled && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Pesanan ini <b>Dibatalkan</b>.
        </div>
      )}
      {isLate && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Pesanan ini berstatus <b>Terlambat</b> (melewati tanggal kembali).
        </div>
      )}

      {/* Stepper */}
      <div className="rounded-xl border border-border bg-card p-4">
        <ol className="flex items-start">
          {FLOW.map((step, i) => {
            const state =
              isCancelled || currentIdx < 0
                ? "upcoming"
                : i < currentIdx
                  ? "done"
                  : i === currentIdx
                    ? "current"
                    : "upcoming";
            return (
              <li
                key={step.key}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <div className="flex w-full items-center">
                  <span
                    className={
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                      (state === "done"
                        ? "bg-forest text-cream"
                        : state === "current"
                          ? "bg-terracotta text-white ring-2 ring-terracotta/20"
                          : "bg-secondary text-muted-foreground")
                    }
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  {i < FLOW.length - 1 && (
                    <span
                      className={
                        "mx-1 h-0.5 flex-1 " +
                        (i < currentIdx ? "bg-forest" : "bg-border")
                      }
                    />
                  )}
                </div>
                <span
                  className={
                    "mt-1 text-center text-[10px] leading-tight " +
                    (state === "upcoming"
                      ? "text-muted-foreground"
                      : "font-medium text-foreground")
                  }
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Actions */}
      {!isCancelled && b.status !== "completed" && next && (
        <form action={updateBookingStatusAction.bind(null, b.id, next.key)}>
          <Button type="submit" className="bg-forest hover:bg-forest-deep">
            Lanjutkan ke {next.label} →
          </Button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Items */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-heading text-lg font-semibold">
            Barang ({b.items.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {b.items.map((bi) => (
              <li
                key={bi.id}
                className="flex justify-between border-b border-border/60 pb-2 last:border-0"
              >
                <span>
                  {bi.item?.name ?? "?"} ×{bi.qty}
                </span>
                <span className="text-muted-foreground">
                  {formatRupiah(bi.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Financials */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-heading text-lg font-semibold">Keuangan</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Sewa</span>
              <span className="font-medium">{formatRupiah(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DP (30%)</span>
              <span className="font-medium">
                {formatRupiah(dp)}{" "}
                {b.dpPaid ? (
                  <span className="text-forest-deep">✓ lunas</span>
                ) : (
                  <span className="text-muted-foreground">· belum</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sisa Tagihan</span>
              <span className="font-medium">{formatRupiah(sisa)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-1">
              <span className="text-muted-foreground">Total Dibayar</span>
              <span className="font-medium">{formatRupiah(totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-heading text-lg font-semibold">
          Riwayat Status
        </h2>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada riwayat.
          </p>
        ) : (
          <ol className="space-y-3">
            {log.map((l) => (
              <li key={l.id} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-forest" />
                <div>
                  <div className="font-medium">
                    {statusLabel[l.status] ?? l.status}
                  </div>
                  <div className="text-muted-foreground">
                    {fmtDateTime(l.createdAt)}
                    {l.note ? ` · ${l.note}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      {canCancel && (
        <form action={updateBookingStatusAction.bind(null, b.id, "cancelled")}>
          <Button
            type="submit"
            variant="outline"
            className="w-full text-destructive"
          >
            Batalkan Pesanan
          </Button>
        </form>
      )}
    </div>
  );
}
