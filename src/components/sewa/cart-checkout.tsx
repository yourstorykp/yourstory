"use client";

import { Fragment, useEffect, useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCartBookingAction,
  type BookingState,
} from "@/app/(public)/actions";
import { useCart } from "./cart-context";
import { formatRupiah } from "@/lib/format";

function diffDays(a: string, b: string) {
  if (!a || !b) return 0;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return d < 0 ? 0 : Math.floor(d) + 1;
}

export function CartCheckout() {
  const { items, clear, setQty, remove } = useCart();
  const [state, formAction] = useActionState<BookingState, FormData>(
    createCartBookingAction,
    {},
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (state.success) clear();
  }, [state.success, clear]);

  if (state.success) {
    const waUrl = state.adminWa 
      ? `https://wa.me/${state.adminWa}?text=${encodeURIComponent(`Halo, saya baru saja membuat pesanan dengan kode *${state.kode}*. Mohon dikonfirmasi.`)}` 
      : null;

    return (
      <div className="rounded-xl border border-forest/30 bg-forest/5 p-6 text-center">
        <h2 className="font-heading text-xl font-semibold text-forest-deep">
          Booking Berhasil Disimpan!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kode booking:{" "}
          <span className="font-medium text-foreground">{state.kode}</span>
        </p>
        <div className="mx-auto mt-4 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total sewa</span>
            <span className="font-medium">{formatRupiah(state.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">DP (perkiraan)</span>
            <span className="font-medium">{formatRupiah(state.dp)}</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Langkah selanjutnya: Konfirmasikan pesanan Anda ke admin kami via WhatsApp.
        </p>
        {waUrl ? (
          <Button
            render={<a href={waUrl} target="_blank" rel="noreferrer" />}
            className="mt-5 w-full bg-green-600 hover:bg-green-700"
          >
            Konfirmasi via WhatsApp
          </Button>
        ) : (
          <Button
            render={<Link href="/" />}
            className="mt-5 w-full bg-forest hover:bg-forest-deep"
          >
            Kembali ke Beranda
          </Button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
        Keranjang kosong.{" "}
        <Link href="/" className="text-forest-deep underline">
          Pilih barang di katalog
        </Link>
        .
      </div>
    );
  }

  const days = diffDays(startDate, endDate);
  const estTotal = items.reduce(
    (s, it) => s + days * it.qty * (Number(it.hargaSewa) || 0),
    0,
  );

  return (
    <form action={formAction} className="space-y-4">
      {items.map((it) => (
        <Fragment key={it.itemId}>
          <input type="hidden" name="itemId" value={it.itemId} />
          <input type="hidden" name="qty" value={it.qty} />
        </Fragment>
      ))}

      <div className="mb-6">
        <h2 className="mb-2 font-heading text-lg font-semibold border-b border-border/50 pb-2">
          Barang ({items.length})
        </h2>
        <ul className="space-y-0 text-sm">
          {items.map((it) => (
            <li key={it.itemId} className="flex flex-col gap-2 border-b border-border/60 py-3 first:pt-1 last:border-0 last:pb-1">
              <div className="flex justify-between">
                <span className="truncate font-medium">{it.name}</span>
                <span className="text-muted-foreground">
                  {formatRupiah(Number(it.hargaSewa) * it.qty)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Kurang"
                    onClick={() => setQty(it.itemId, Math.max(1, it.qty - 1))}
                    disabled={it.qty <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-transform hover:bg-muted active:scale-90 active:bg-border select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={1}
                    max={it.stokTotal || 99}
                    value={it.qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                      const max = Number(it.stokTotal) || 99;
                      setQty(it.itemId, Number.isFinite(v) ? Math.min(max, Math.max(1, v)) : 1);
                    }}
                    className="h-7 w-10 rounded-md border border-input bg-card px-1 text-center text-xs font-semibold shadow-inner"
                  />
                  <button
                    type="button"
                    aria-label="Tambah"
                    onClick={() => setQty(it.itemId, Math.min(Number(it.stokTotal) || 99, it.qty + 1))}
                    disabled={it.qty >= (Number(it.stokTotal) || 99)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-transform hover:bg-muted active:scale-90 active:bg-border select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.itemId)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal Sewa *</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Tanggal Kembali *</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap *</Label>
        <Input id="name" name="name" required placeholder="Nama penyewa" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact">Nomor WhatsApp *</Label>
        <Input id="contact" name="contact" required placeholder="08xx…" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (opsional)</Label>
        <Input id="email" name="email" type="email" placeholder="nama@mail.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Alamat pengantaran, request khusus, dll."
        />
      </div>

      {days > 0 && (
        <div className="rounded-lg bg-muted/60 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimasi total ({days} hari)</span>
            <span className="font-medium">{formatRupiah(estTotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total & DP final dikonfirmasi admin.
          </p>
        </div>
      )}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="w-full bg-forest hover:bg-forest-deep">
        Kirim Booking
      </Button>
    </form>
  );
}
