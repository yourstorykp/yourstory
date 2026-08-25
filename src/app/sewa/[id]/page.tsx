import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { items, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";
import { BookingForm } from "@/components/sewa/booking-form";

export const revalidate = 120;

function satuanLabel(s: string) {
  return s === "hari" ? "hari" : s === "minggu" ? "minggu" : s === "bulan" ? "bulan" : "jam";
}

const getItem = unstable_cache(
  async (itemId: number) => {
    const [item] = await db.query.items.findMany({
      with: { category: true, consignor: true },
      where: eq(items.id, itemId),
      limit: 1,
    });
    if (!item) return null;
    const s = await db.select().from(settings).limit(1);
    const dpPct = Number(s[0]?.defaultDpPct ?? 30);
    return { item, dpPct };
  },
  ["sewa-item"],
  { revalidate: 120, tags: ["items"] },
);

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);
  if (Number.isNaN(itemId)) notFound();

  const data = await getItem(itemId);
  if (!data) notFound();
  const { item, dpPct } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/sewa"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Kembali ke katalog
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-forest/25 to-sand">
          {item.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.fotoUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-heading text-7xl font-semibold text-forest/70">
              {item.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info + form */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-terracotta/15 text-terracotta-deep">
                {item.category?.name ?? "Tanpa kategori"}
              </Badge>
              {item.ownerType === "consignor" && (
                <Badge variant="outline">Titipan · {item.consignor?.name ?? "?"}</Badge>
              )}
            </div>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-forest-deep">
              {item.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{item.sku ? `SKU ${item.sku}` : "—"}</p>
          </div>

          <div className="text-2xl font-semibold text-forest-deep">
            {formatRupiah(item.hargaSewa)}
            <span className="text-sm font-normal text-muted-foreground">
              /{satuanLabel(item.satuanSewa)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{item.description ?? "Belum ada deskripsi."}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-3 py-1">
              Stok tersedia: {item.stokTotal}
            </span>
            {item.maintenanceDays > 0 && (
              <span className="rounded-full bg-muted px-3 py-1">
                Maintenance: {item.maintenanceDays} hri
              </span>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-heading text-lg font-semibold">Form Booking</h2>
            <BookingForm
              item={{
                id: item.id,
                hargaSewa: item.hargaSewa,
                stokTotal: item.stokTotal,
                satuanSewa: item.satuanSewa,
              }}
              dpPct={dpPct}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
