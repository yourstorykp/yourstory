"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBookingAction, type BookingState } from "@/app/(public)/actions";
import { formatRupiah } from "@/lib/format";

function diffDays(a: string, b: string) {
  if (!a || !b) return 0;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return d < 0 ? 0 : Math.floor(d) + 1;
}

function satuanLabel(s: string) {
  return s === "hari" ? "hari" : s === "minggu" ? "minggu" : s === "bulan" ? "bulan" : "jam";
}

export function BookingForm({
  item,
  dpPct,
}: {
  item: {
    id: number;
    hargaSewa: number | string;
    stokTotal: number;
    satuanSewa: string;
  };
  dpPct: number;
}) {
  const [state, formAction] = useActionState<BookingState, FormData>(
    createBookingAction,
    {},
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [qty, setQty] = useState(1);

  const price = Number(item.hargaSewa) || 0;
  const days = diffDays(startDate, endDate);
  const estTotal = days * qty * price;
  const estDp = Math.round((estTotal * dpPct) / 100);
  const max = Number(item.stokTotal) || 99;

  if (state.success) {
    return (
      <div className="rounded-xl border border-forest/30 bg-forest/5 p-6 text-center">
        <h3 className="font-heading text-xl font-semibold text-forest-deep">
          Booking terkirim!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Kode booking: <span className="font-medium text-foreground">{state.kode}</span>
        </p>
        <div className="mx-auto mt-4 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total sewa</span>
            <span className="font-medium">{formatRupiah(state.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">DP {dpPct}% (perkiraan)</span>
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

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="itemId" value={item.id} />

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
        <Label htmlFor="qty">Jumlah Unit</Label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Kurang"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input bg-background text-lg font-medium hover:bg-muted"
          >
            −
          </button>
          <Input
            id="qty"
            name="qty"
            type="text"
            inputMode="numeric"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
              setQty(Number.isFinite(v) ? Math.min(max, Math.max(1, v)) : 1);
            }}
            className="text-center"
          />
          <button
            type="button"
            aria-label="Tambah"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input bg-background text-lg font-medium hover:bg-muted"
          >
            +
          </button>
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
            <span className="text-muted-foreground">
              Estimasi ({days} {satuanLabel(item.satuanSewa)}
              {days > 1 ? "" : ""} × {qty} unit)
            </span>
            <span className="font-medium">{formatRupiah(estTotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>DP {dpPct}% (perkiraan)</span>
            <span>{formatRupiah(estDp)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total & DP final dikonfirmasi admin.
          </p>
        </div>
      )}

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full bg-forest hover:bg-forest-deep">
        Kirim Booking
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Dengan mengirim, kamu menyetujui syarat sewa yourstory.kp.
      </p>
    </form>
  );
}
