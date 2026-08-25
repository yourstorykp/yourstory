"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";
import { BookingForm } from "@/components/sewa/booking-form";

export type CatalogItem = {
  id: number;
  name: string;
  description: string | null;
  hargaSewa: number | string;
  satuanSewa: string;
  stokTotal: number;
  fotoUrl: string | null;
  maintenanceDays: number;
  categoryId: number | null;
  category?: { name: string } | null;
  ownerType?: string;
  consignor?: { name: string } | null;
};

type CatalogCategory = { id: number; name: string };

function satuanLabel(s: string) {
  return s === "hari" ? "hari" : s === "minggu" ? "minggu" : s === "bulan" ? "bulan" : "jam";
}

export function CatalogClient({
  items,
  categories,
  dpPct,
}: {
  items: CatalogItem[];
  categories: CatalogCategory[];
  dpPct: number;
}) {
  const [cat, setCat] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Inisialisasi dari URL (untuk link shareable) + sync back button
  useEffect(() => {
    const u = new URL(window.location.href);
    setCat(u.searchParams.get("cat") ?? "");
    setQ(u.searchParams.get("q") ?? "");
    const itemParam = u.searchParams.get("item");
    if (itemParam) setSelectedId(Number(itemParam));
  }, []);

  useEffect(() => {
    const onPop = () => {
      const u = new URL(window.location.href);
      const itemParam = u.searchParams.get("item");
      setSelectedId(itemParam ? Number(itemParam) : null);
      setCat(u.searchParams.get("cat") ?? "");
      setQ(u.searchParams.get("q") ?? "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const syncUrl = (nextCat: string, nextQ: string, nextItem: number | null) => {
    const u = new URL(window.location.href);
    if (nextCat) u.searchParams.set("cat", nextCat);
    else u.searchParams.delete("cat");
    if (nextQ) u.searchParams.set("q", nextQ);
    else u.searchParams.delete("q");
    if (nextItem) u.searchParams.set("item", String(nextItem));
    else u.searchParams.delete("item");
    window.history.replaceState({}, "", u.toString());
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (cat && String(it.categoryId) !== cat) return false;
      if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, cat, q]);

  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  const openItem = (id: number) => {
    setSelectedId(id);
    syncUrl(cat, q, id);
  };
  const closeItem = () => {
    setSelectedId(null);
    syncUrl(cat, q, null);
  };

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
            onChange={(e) => {
              setQ(e.target.value);
              syncUrl(cat, e.target.value, selectedId);
            }}
            placeholder="Cari barang…"
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            type="button"
            onClick={() => {
              setQ("");
              syncUrl(cat, "", selectedId);
            }}
            className="bg-forest hover:bg-forest-deep"
          >
            Cari
          </Button>
        </div>
      </section>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCat("");
            syncUrl("", q, selectedId);
          }}
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
            onClick={() => {
              setCat(String(c.id));
              syncUrl(String(c.id), q, selectedId);
            }}
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
          <button
            key={it.id}
            type="button"
            onClick={() => openItem(it.id)}
            className="group block overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-md"
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
          </button>
        ))}
      </div>

      {/* Modal detail + booking */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={closeItem}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-background p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-terracotta/15 text-terracotta-deep">
                    {selected.category?.name ?? "Tanpa kategori"}
                  </Badge>
                  {selected.ownerType === "consignor" && (
                    <Badge variant="outline">
                      Titipan · {selected.consignor?.name ?? "?"}
                    </Badge>
                  )}
                </div>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-forest-deep">
                  {selected.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeItem}
                aria-label="Tutup"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-forest/25 to-sand">
                {selected.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.fotoUrl}
                    alt={selected.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-heading text-7xl font-semibold text-forest/70">
                    {selected.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-2xl font-semibold text-forest-deep">
                  {formatRupiah(selected.hargaSewa)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{satuanLabel(selected.satuanSewa)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selected.description ?? "Belum ada deskripsi."}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-muted px-3 py-1">
                    Stok tersedia: {selected.stokTotal}
                  </span>
                  {selected.maintenanceDays > 0 && (
                    <span className="rounded-full bg-muted px-3 py-1">
                      Maintenance: {selected.maintenanceDays} hri
                    </span>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-heading text-lg font-semibold">
                    Form Booking
                  </h3>
                  <BookingForm
                    item={{
                      id: selected.id,
                      hargaSewa: selected.hargaSewa,
                      stokTotal: selected.stokTotal,
                      satuanSewa: selected.satuanSewa,
                    }}
                    dpPct={dpPct}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href={`/sewa/${selected.id}`}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Buka halaman lengkap
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
