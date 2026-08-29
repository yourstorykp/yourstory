import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { items, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";
import { getItemAvailability } from "@/lib/availability";
import { BookingModal } from "@/components/sewa/booking-modal";
import { AddToCartButton } from "@/components/sewa/add-to-cart";

export const revalidate = 120;

function satuanLabel(s: string) {
  return s === "hari" ? "hari" : s === "minggu" ? "minggu" : s === "bulan" ? "bulan" : "jam";
}

const getItem = unstable_cache(
  async (itemId: number) => {
    const [itemRows, s] = await Promise.all([
      db.query.items.findMany({
        with: { category: true },
        where: eq(items.id, itemId),
        limit: 1,
      }),
      db.select().from(settings).limit(1),
    ]);
    const [item] = itemRows;
    if (!item) return null;
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

  const [data, availability] = await Promise.all([
    getItem(itemId),
    getItemAvailability(itemId),
  ]);
  if (!data) notFound();
  const { item, dpPct } = data;

  const { ranges } = availability;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = ranges.filter((r) => r.end >= today);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/"
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
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-terracotta/15 text-terracotta-deep">
                  {item.category?.name ?? "Tanpa kategori"}
                </Badge>
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
            {upcoming.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Sudah terbooking:{" "}
                {upcoming.map((r) => `${r.start}–${r.end}`).join(" · ")}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-3 py-1">
                Stok tersedia: {item.stokTotal}
              </span>
                {upcoming.length > 0 ? (
                  <span className="rounded-full bg-terracotta/15 px-3 py-1 text-terracotta-deep">
                    {upcoming.length} periode terbooking
                  </span>
                ) : (
                  <span className="rounded-full bg-forest/15 px-3 py-1 text-forest-deep">
                    Tersedia
                  </span>
                )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-heading text-lg font-semibold">Booking</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pilih tanggal sewa dan jumlah unit, lalu tim kami akan konfirmasi
              ketersediaan & pembayaran via WhatsApp.
            </p>
              <AddToCartButton
                item={{
                  id: item.id,
                  name: item.name,
                  hargaSewa: item.hargaSewa,
                  stokTotal: item.stokTotal,
                  satuanSewa: item.satuanSewa,
                  fotoUrl: item.fotoUrl,
                }}
              />
              <BookingModal
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
