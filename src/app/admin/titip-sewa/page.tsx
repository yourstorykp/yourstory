import { db } from "@/lib/db";
import { consignors, items, bookingItems } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { ConsignorForm } from "@/components/admin/consignor-form";
import { ConsignorSwitcher } from "@/components/admin/consignor-switcher";
import { PaidCheckbox } from "@/components/consignor/paid-checkbox";
import { createConsignorAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function TitipSewaPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;

  const allConsignors = await db
    .select({ id: consignors.id, name: consignors.name })
    .from(consignors)
    .orderBy(desc(consignors.id));

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
    const bis = itemIds.length
      ? await db.query.bookingItems.findMany({
          where: inArray(bookingItems.itemId, itemIds),
          with: { booking: true, item: true },
        })
      : [];
    rows = bis.map((bi) => ({
      id: bi.id,
      name: bi.item?.name ?? null,
      startDate: bi.booking?.startDate ?? null,
      status: bi.booking?.status ?? null,
      subtotal: bi.subtotal,
      pct: Number(bi.item?.profitSharePct || 0),
      paid: !!bi.consignorPaid,
    }));
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
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Titip Sewa</h1>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-heading text-lg font-semibold">Tambah Pemilik Titipan</h2>
        <ConsignorForm action={createConsignorAction} />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">
            Riwayat Sewa
            {currentId && allConsignors.find((x) => x.id === currentId)
              ? ` — ${allConsignors.find((x) => x.id === currentId)!.name}`
              : ""}
          </h2>
          {allConsignors.length > 0 && (
            <ConsignorSwitcher consignors={allConsignors} current={currentId} />
          )}
        </div>

        {!currentId ? (
          <p className="text-sm text-muted-foreground">
            Belum ada pemilik titipan. Tambahkan di atas untuk melihat riwayat.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada penyewaan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-2">Tgl</th>
                  <th className="px-4 py-2">Barang</th>
                  <th className="px-4 py-2 text-right">Harga</th>
                  <th className="px-4 py-2 text-right">Bagi Hasil</th>
                  <th className="px-4 py-2 text-center">Lunas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="px-4 py-2 text-muted-foreground">
                      {r.startDate ? formatTanggal(r.startDate) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{r.name ?? "?"}</div>
                      <div className="text-xs text-muted-foreground">{r.status}</div>
                    </td>
                    <td className="px-4 py-2 text-right">{formatRupiah(r.subtotal)}</td>
                    <td className="px-4 py-2 text-right text-forest-deep">
                      {formatRupiah(String(Math.round((Number(r.subtotal || 0) * r.pct) / 100)))}
                      <span className="text-xs text-muted-foreground"> ({r.pct}%)</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <PaidCheckbox id={r.id} checked={r.paid} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-medium">
                  <td className="px-4 py-2" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-2 text-right">{formatRupiah(String(totalRevenue))}</td>
                  <td className="px-4 py-2 text-right">{formatRupiah(String(Math.round(totalShare)))}</td>
                  <td className="px-4 py-2 text-center text-xs text-muted-foreground">
                    {formatRupiah(String(Math.round(unpaidShare)))} blm
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
