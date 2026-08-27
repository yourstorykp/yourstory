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
  const { items, clear } = useCart();
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
    return (
      <div className="rounded-xl border border-forest/30 bg-forest/5 p-6 text-center">
        <h2 className="font-heading text-xl font-semibold text-forest-deep">
          Booking terkirim!
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
          Admin akan mengonfirmasi ketersediaan & mengirim detail pembayaran
          via WhatsApp. Terima kasih!
        </p>
        <Button
          render={<Link href="/" />}
          className="mt-5 bg-forest hover:bg-forest-deep"
        >
          Kembali ke katalog
        </Button>
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

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 font-heading text-lg font-semibold">
          Barang ({items.length})
        </h2>
        <ul className="space-y-1 text-sm">
          {items.map((it) => (
            <li key={it.itemId} className="flex justify-between border-b border-border/60 pb-1 last:border-0">
              <span className="truncate">
                {it.name} ×{it.qty}
              </span>
              <span className="text-muted-foreground">
                {formatRupiah(Number(it.hargaSewa) * it.qty)}
              </span>
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
