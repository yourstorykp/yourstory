import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { bookings, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "@/lib/format";
import { getItemAvailability } from "@/lib/availability";
import { updateBookingStatusAction, markDpPaidAction, addPaymentAction } from "../actions";

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

const FLOW = [
  { key: "booking", label: "Pesanan Masuk" },
  { key: "confirmed", label: "Dikonfirmasi" },
  { key: "active", label: "Diserahkan" },
  { key: "returned", label: "Dikembalikan" },
  { key: "completed", label: "Selesai" },
];

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "cancelled"
      ? "bg-red-100 text-red-700"
      : status === "completed" || status === "returned"
        ? "bg-forest/15 text-forest-deep"
        : status === "active" || status === "late"
          ? "bg-terracotta/15 text-terracotta-deep"
          : "bg-amber-100 text-amber-700";
  return (
    <Badge variant="secondary" className={tone}>
      {statusLabel[status] ?? status}
    </Badge>
  );
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookingId = Number(id);
  if (Number.isNaN(bookingId)) notFound();

  const [b] = await db.query.bookings.findMany({
    where: eq(bookings.id, bookingId),
    with: { customer: true, items: { with: { item: true } }, statusLog: true },
    limit: 1,
  });
  if (!b) notFound();

  const pays = await db
    .select()
    .from(payments)
    .where(eq(payments.bookingId, bookingId));

  const totalPaid = pays.reduce((s, p) => s + Number(p.amount || 0), 0);

  const isLate = b.status === "late";
  const isCancelled = b.status === "cancelled";
  let currentIdx = FLOW.findIndex((s) => s.key === b.status);
  if (isLate) currentIdx = FLOW.findIndex((s) => s.key === "active");
  const next = currentIdx >= 0 ? FLOW[currentIdx + 1] : undefined;

  const log = [...(b.statusLog || [])].sort(
    (a, c) => new Date(a.createdAt).getTime() - new Date(c.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/bookings"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Kembali ke booking
          </Link>
          <h1 className="font-heading text-2xl font-semibold">
            Booking YS-{b.id}-{new Date(b.createdAt).getFullYear()}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={b.status} />
            <span className="text-sm text-muted-foreground">
              {formatTanggal(b.startDate)} s.d. {formatTanggal(b.endDate)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Link href={`/admin/bookings/${b.id}/invoice`}>
            <Button variant="outline" size="sm">
              Cetak Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper */}
      <div className="rounded-xl border border-border bg-card p-4">
        <ol className="flex items-start">
          {FLOW.map((step, i) => {
            const state =
              b.status === "cancelled" || currentIdx < 0
                ? "upcoming"
                : i < currentIdx
                  ? "done"
                  : i === currentIdx
                    ? "current"
                    : "upcoming";
            return (
              <li
                key={step.key}
                className="flex min-w-0 flex-1 flex-col items-start"
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
                    "mt-1 w-7 text-center text-[10px] leading-tight " +
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

      {/* Status actions */}
      {!isCancelled && b.status !== "completed" && next && (
        <form action={updateBookingStatusAction.bind(null, b.id, next.key)}>
          <Button type="submit" className="bg-forest hover:bg-forest-deep">
            Lanjutkan ke {next.label} →
          </Button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Customer & items */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 font-heading text-lg font-semibold">Pelanggan</h2>
            <p className="text-sm">{b.customer?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{b.customer?.contact ?? ""}</p>
            {b.customer?.email && (
              <p className="text-sm text-muted-foreground">{b.customer.email}</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 font-heading text-lg font-semibold">Barang</h2>
            <ul className="space-y-2 text-sm">
              {b.items.map((bi) => (
                <li key={bi.id} className="flex justify-between border-b border-border/60 pb-2 last:border-0">
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
        </div>

        {/* Financials & payments */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 font-heading text-lg font-semibold">Keuangan</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total sewa</span>
                <span className="font-medium">{formatRupiah(b.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DP (30%)</span>
                <span className="font-medium">{formatRupiah(b.dpAmount)}</span>
                {b.dpPaid ? (
                  <span className="text-forest-deep">✓ lunas</span>
                ) : (
                  <form action={markDpPaidAction.bind(null, b.id)}>
                    <Button type="submit" size="sm" variant="outline" className="h-6 px-2 text-xs">
                      Tandai lunas
                    </Button>
                  </form>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa</span>
                <span className="font-medium">{formatRupiah(b.remaining)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-1">
                <span className="text-muted-foreground">Total dibayar</span>
                <span className="font-medium">{formatRupiah(String(totalPaid))}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 font-heading text-lg font-semibold">
              Riwayat Pembayaran
            </h2>
            {pays.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pembayaran.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {pays.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {p.type} · {p.method ?? "—"}
                    </span>
                    <span className="font-medium">{formatRupiah(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}

            <form action={addPaymentAction} className="mt-4 space-y-2 border-t border-border/60 pt-4">
              <input type="hidden" name="bookingId" value={b.id} />
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="type"
                  defaultValue="remaining"
                  className="h-9 rounded-lg border border-input bg-card px-2 text-sm"
                >
                  <option value="dp">DP</option>
                  <option value="remaining">Sisa</option>
                  <option value="denda">Denda</option>
                </select>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Nominal"
                  required
                  className="h-9 rounded-lg border border-input bg-card px-2 text-sm"
                />
              </div>
              <input
                name="method"
                placeholder="Metode (TF BCA, tunai, …)"
                className="h-9 w-full rounded-lg border border-input bg-card px-2 text-sm"
              />
              <Button type="submit" size="sm" className="w-full bg-forest hover:bg-forest-deep">
                Catat Pembayaran
              </Button>
            </form>
          </div>

          {b.notes && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <span className="text-muted-foreground">Catatan: </span>
              {b.notes}
            </div>
          )}
        </div>

        {/* Timeline status */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-heading text-lg font-semibold">
            Riwayat Status
          </h2>
          {log.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
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
                      {formatTanggalWaktu(l.createdAt)}
                      {l.note ? ` · ${l.note}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {b.status !== "cancelled" && b.status !== "completed" && (
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
    </div>
  );
}
