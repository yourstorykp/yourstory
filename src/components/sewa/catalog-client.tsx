"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";
import { useCart } from "./cart-context";

export type CatalogItem = {
  id: number;
  name: string;
  description: string | null;
  hargaSewa: number | string;
  satuanSewa: string;
  stokTotal: number;
  fotoUrl: string | null;
  categoryId: number | null;
  category?: { name: string } | null;
};

type CatalogCategory = { id: number; name: string };

function satuanLabel(s: string) {
  return s === "hari" ? "hari" : s === "minggu" ? "minggu" : s === "bulan" ? "bulan" : "jam";
}

export function CatalogClient({
  items,
  categories,
}: {
  items: CatalogItem[];
  categories: CatalogCategory[];
}) {
  const { add } = useCart();
  const [cat, setCat] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (cat && String(it.categoryId) !== cat) return false;
      if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, cat, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-forest/10 via-cream to-sand px-6 py-10 text-center">
        <h1 className="font-heading text-3xl font-semibold text-forest-deep sm:text-4xl">
          Sewa alat petualanganmu
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Kamera, tenda, dan perlengkapan outdoor. Pilih tanggal, booking, dan
          tim kami akan konfirmasi via WhatsApp.
        </p>
        <div className="mx-auto mt-5 flex max-w-md gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari barang…"
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="button" className="bg-forest hover:bg-forest-deep">
            Cari
          </Button>
        </div>
      </section>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat("")}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            !cat
              ? "border-forest bg-forest text-cream"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(String(c.id))}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              cat === String(c.id)
                ? "border-forest bg-forest text-cream"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
            {q || cat
              ? "Tidak ada barang yang cocok dengan filter."
              : "Belum ada barang di katalog. Admin dapat menambah lewat halaman Inventaris."}
          </div>
        )}
        {filtered.map((it) => (
          <Link
            key={it.id}
            href={`/sewa/${it.id}`}
            className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-forest/25 to-sand">
              {it.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.fotoUrl}
                  alt={it.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-heading text-5xl font-semibold text-forest/70">
                  {it.name.charAt(0).toUpperCase()}
                </span>
              )}
              <Badge
                variant="secondary"
                className="absolute left-2 top-2 bg-cream/90 text-forest-deep"
              >
                {it.category?.name ?? "Tanpa kategori"}
              </Badge>
              <button
                type="button"
                aria-label="Tambah ke keranjang"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  add(
                    {
                      itemId: it.id,
                      name: it.name,
                      hargaSewa: it.hargaSewa,
                      satuanSewa: it.satuanSewa,
                      stokTotal: it.stokTotal,
                    },
                    1,
                  );
                }}
                className="absolute right-2 top-2 rounded-full bg-forest px-2 py-1 text-xs font-medium text-cream shadow hover:bg-forest-deep"
              >
                + Keranjang
              </button>
            </div>
            <div className="space-y-1 p-4">
              <h3 className="font-heading text-lg font-semibold leading-snug">
                {it.name}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {it.description ?? "—"}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-medium text-forest-deep">
                  {formatRupiah(it.hargaSewa)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /{satuanLabel(it.satuanSewa)}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Stok {it.stokTotal}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
