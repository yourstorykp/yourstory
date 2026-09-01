import { db } from "@/lib/db";
import { consignors, items, bookingItems, bookings } from "@/db/schema";
import { desc, eq, inArray, and, gte, lte } from "drizzle-orm";
import { formatRupiahCompact, formatTanggal } from "@/lib/format";
import { ConsignorDialog } from "@/components/admin/consignor-dialog";
import { TitipSewaControls } from "@/components/admin/titip-sewa-controls";
import { SewaRowActions } from "@/components/admin/sewa-row-actions";
import { PaidCheckbox } from "@/components/consignor/paid-checkbox";

export const dynamic = "force-dynamic";

const NAMA_BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default async function TitipSewaPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; m?: string }>;
}) {
  const { c, m } = await searchParams;

  const allConsignors = await db
    .select({ id: consignors.id, name: consignors.name })
    .from(consignors)
    .orderBy(desc(consignors.id));

  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const activeMonth = m || currentMonthValue;
  const [ay, am] = activeMonth.split("-").map(Number);

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { value, label: `${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}` };
  });

  const currentId = c ? Number(c) : allConsignors[0]?.id ?? null;

  let rows: {
    id: number;
    name: string | null;
    startDate: Date | string | null;
    status: string | null;
    subtotal: string | null;
    pct: number;
    paid: boolean;
  }[] = [];

  if (currentId) {
    const myItems = await db.query.items.findMany({
      where: eq(items.consignorId, currentId),
      columns: { id: true },
    });
    const itemIds = myItems.map((i) => i.id);
    
    if (itemIds.length) {
      const startOfMonth = `${ay}-${String(am).padStart(2, "0")}-01`;
      const endOfMonth = `${ay}-${String(am).padStart(2, "0")}-31`;
      
      const bis = await db.select({
        id: bookingItems.id,
        name: items.name,
        startDate: bookings.startDate,
        status: bookings.status,
        subtotal: bookingItems.subtotal,
        pct: items.profitSharePct,
        paid: bookingItems.consignorPaid,
      })
      .from(bookingItems)
      .innerJoin(bookings, eq(bookingItems.bookingId, bookings.id))
      .innerJoin(items, eq(bookingItems.itemId, items.id))
      .where(
        and(
          inArray(bookingItems.itemId, itemIds),
          gte(bookings.startDate, startOfMonth),
          lte(bookings.startDate, endOfMonth)
        )
      );
      
      rows = bis.map((bi) => ({
        id: bi.id,
        name: bi.name,
        startDate: bi.startDate,
        status: bi.status,
        subtotal: bi.subtotal,
        pct: Number(bi.pct || 0),
        paid: !!bi.paid,
      }));
    }
  }

  let totalRevenue = 0;
  let totalShare = 0;
  let unpaidShare = 0;
  for (const r of rows) {
    const sub = Number(r.subtotal || 0);
    const share = (sub * r.pct) / 100;
    totalRevenue += sub;
    totalShare += share;
    if (!r.paid) unpaidShare += share;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Titip Sewa</h1>
        <ConsignorDialog />
      </div>

      <TitipSewaControls
        consignors={allConsignors}
        months={months}
        current={currentId}
        currentMonth={activeMonth}
      />

      {!currentId ? (
        <p className="text-sm text-muted-foreground">
          Belum ada pemilik titipan. Klik “Tambah Pemilik Titipan” untuk membuat.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tidak ada riwayat sewa pada bulan {activeMonth}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-3 py-2">Tgl</th>
                <th className="px-3 py-2">Barang</th>
                <th className="px-3 py-2 text-right">Harga</th>
                <th className="px-3 py-2 text-right">Bagi Hasil</th>
                <th className="px-3 py-2 text-center">Lunas</th>
                <th className="px-3 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.startDate ? formatTanggal(r.startDate) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.name ?? "?"}</div>
                    <div className="text-[10px] text-muted-foreground">{r.status}</div>
                  </td>
                  <td className="px-3 py-2 text-right">{formatRupiahCompact(r.subtotal)}</td>
                  <td className="px-3 py-2 text-right text-forest-deep">
                    {formatRupiahCompact((Number(r.subtotal || 0) * r.pct) / 100)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <PaidCheckbox id={r.id} checked={r.paid} />
                  </td>
                  <td className="px-3 py-2">
                    <SewaRowActions id={r.id} subtotal={r.subtotal} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border font-medium">
                <td className="px-3 py-2" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-2 text-right">{formatRupiahCompact(totalRevenue)}</td>
                <td className="px-3 py-2 text-right">{formatRupiahCompact(totalShare)}</td>
                <td className="px-3 py-2 text-center text-[10px] text-muted-foreground">
                  {formatRupiahCompact(unpaidShare)} blm
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
