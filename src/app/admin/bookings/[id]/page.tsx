import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { bookings, payments, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatRupiah } from "@/lib/format";
import { getItemAvailability } from "@/lib/availability";
import { updateBookingStatusAction, markDpPaidAction, addPaymentAction, addDocumentAction } from "../actions";

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

const transitions: { to: string; label: string; cls: string }[] = [
  { to: "confirmed", label: "Konfirmasi", cls: "bg-forest hover:bg-forest-deep" },
  { to: "active", label: "Tandai Diambil", cls: "bg-terracotta hover:bg-terracotta-deep text-white" },
  { to: "returned", label: "Tandai Kembali", cls: "bg-forest hover:bg-forest-deep" },
  { to: "completed", label: "Selesai", cls: "bg-forest hover:bg-forest-deep" },
  { to: "cancelled", label: "Batalkan", cls: "bg-muted-foreground/20 hover:bg-muted-foreground/30" },
];

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
    with: { customer: true, items: { with: { item: true } } },
    limit: 1,
  });
  if (!b) notFound();

  const pays = await db
    .select()
    .from(payments)
    .where(eq(payments.bookingId, bookingId));

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.bookingId, bookingId));

  const totalPaid = pays.reduce((s, p) => s + Number(p.amount || 0), 0);

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
              {b.startDate} s.d. {b.endDate}
            </span>
          </div>
        </div>
      </div>

      {/* Status actions */}
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <form key={t.to} action={updateBookingStatusAction.bind(null, b.id, t.to)}>
            <Button
              type="submit"
              className={t.cls}
              variant={t.to === b.status ? "outline" : "default"}
              disabled={t.to === b.status}
            >
              {t.label}
            </Button>
          </form>
        ))}
      </div>

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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit</span>
                <span>
                  {b.depositReceived ? "✓ diterima" : "belum"} /{" "}
                  {b.depositReturned ? "✓ dikembalikan" : "ditahan"}
                </span>
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

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 font-heading text-lg font-semibold">Dokumen</h2>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada dokumen.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {docs.map((d) => (
                  <li key={d.id}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-forest-deep underline-offset-2 hover:underline"
                    >
                      {d.type} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <form action={addDocumentAction} className="mt-4 space-y-2 border-t border-border/60 pt-4">
              <input type="hidden" name="bookingId" value={b.id} />
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="type"
                  defaultValue="ktp"
                  className="h-9 rounded-lg border border-input bg-card px-2 text-sm"
                >
                  <option value="ktp">KTP</option>
                  <option value="selfie">Selfie</option>
                  <option value="other">Lainnya</option>
                </select>
                <input
                  name="url"
                  placeholder="URL dokumen"
                  required
                  className="h-9 rounded-lg border border-input bg-card px-2 text-sm"
                />
              </div>
              <Button type="submit" size="sm" className="w-full bg-forest hover:bg-forest-deep">
                Tambah Dokumen
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
      </div>
    </div>
  );
}
