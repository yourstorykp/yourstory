import { auth } from "@/auth";
import { db } from "@/lib/db";
import { items, bookingItems, bookings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { formatRupiah, formatRupiahCompact, formatTanggal } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConsignorDashboard() {
  const session = await auth();
  const cid = Number((session?.user as { id?: string })?.id);
  if (!cid) return null;

  const myItems = await db.query.items.findMany({
    where: eq(items.consignorId, cid),
    with: { category: true },
    orderBy: (items, { desc }) => [desc(items.createdAt)],
  });

  const itemIds = myItems.map((i) => i.id);
  const bis = itemIds.length
    ? await db.query.bookingItems.findMany({
        where: inArray(bookingItems.itemId, itemIds),
        with: { booking: true, item: true },
      })
    : [];

  let totalRevenue = 0;
  let totalShare = 0;
  let unpaidShare = 0;
  for (const bi of bis) {
    const sub = Number(bi.subtotal || 0);
    const pct = Number(bi.item?.profitSharePct || 0);
    const share = (sub * pct) / 100;
    totalRevenue += sub;
    totalShare += share;
    if (!bi.consignorPaid) unpaidShare += share;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard Pemilik Titipan</h1>
        <p className="text-sm text-muted-foreground">
          Pantau barang titipan, riwayat sewa, dan total bagi hasil.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Barang Titipan</div>
          <div className="font-heading text-2xl font-semibold">{myItems.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Omzet</div>
          <div className="font-heading text-2xl font-semibold">
            {formatRupiah(String(totalRevenue))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Bagi Hasil</div>
          <div className="font-heading text-2xl font-semibold text-forest-deep">
            {formatRupiah(String(Math.round(totalShare)))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-heading text-lg font-semibold">Barang Titipan</h2>
        </div>
        <ul className="divide-y divide-border/60">
          {myItems.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada barang titipan.
            </li>
          )}
          {myItems.map((it) => (
            <li key={it.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-muted-foreground">
                  {it.category?.name ?? "—"} · bagi hasil {it.profitSharePct ?? 0}%
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatRupiah(it.hargaSewa)}/{it.satuanSewa}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-heading text-lg font-semibold">Riwayat Sewa Barang Titipan</h2>
        </div>
        {bis.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada penyewaan.
          </p>
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
                {bis.map((bi) => {
                  const sub = Number(bi.subtotal || 0);
                  const pct = Number(bi.item?.profitSharePct || 0);
                  const share = (sub * pct) / 100;
                  return (
                    <tr key={bi.id} className="border-b border-border/60">
                      <td className="px-4 py-2 text-muted-foreground">
                        {formatTanggal(bi.booking?.startDate)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{bi.item?.name ?? "?"}</div>
                        <div className="text-xs text-muted-foreground">
                          {bi.booking?.status}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">{formatRupiahCompact(bi.subtotal)}</td>
                      <td className="px-4 py-2 text-right text-forest-deep">
                        {formatRupiahCompact(String(Math.round(share)))}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {bi.consignorPaid ? (
                          <span className="text-xs font-medium text-forest-deep">Lunas</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Belum lunas</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-medium">
                  <td className="px-4 py-2" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-2 text-right">{formatRupiahCompact(String(totalRevenue))}</td>
                  <td className="px-4 py-2 text-right">
                    {formatRupiahCompact(String(Math.round(totalShare)))}
                  </td>
                  <td className="px-4 py-2 text-center text-xs text-muted-foreground">
                    {formatRupiah(String(Math.round(unpaidShare)))} blm
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Login consignor demo: <span className="font-medium">consignor@yourstory.kp</span> /{" "}
        <span className="font-medium">consignor1234</span>. Centang kolom &quot;Lunas&quot; bila
        bagi hasil sudah dibayarkan ke pemilik titipan.
      </p>
    </div>
  );
}
