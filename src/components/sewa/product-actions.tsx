"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { BookingModal } from "./booking-modal";

export function ProductActions({
  item,
  dpPct,
}: {
  item: {
    id: number;
    name: string;
    hargaSewa: number | string;
    satuanSewa: string;
    stokTotal: number;
    fotoUrl?: string | null;
  };
  dpPct: number;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const max = Number(item.stokTotal) || 99;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Jumlah unit:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Kurang"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-lg font-medium hover:bg-muted transition-colors"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
              setQty(Number.isFinite(v) ? Math.min(max, Math.max(1, v)) : 1);
            }}
            className="h-9 w-16 rounded-lg border border-input bg-card px-2 text-center text-sm font-semibold shadow-inner"
          />
          <button
            type="button"
            aria-label="Tambah"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-lg font-medium hover:bg-muted transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={(e) =>
            add(
              {
                itemId: item.id,
                name: item.name,
                hargaSewa: item.hargaSewa,
                satuanSewa: item.satuanSewa,
                stokTotal: item.stokTotal,
              },
              qty,
              e,
              item.fotoUrl
            )
          }
          className="w-full bg-forest hover:bg-forest-deep"
        >
          Tambah ke Keranjang
        </Button>

        <BookingModal
          item={{
            id: item.id,
            hargaSewa: item.hargaSewa,
            stokTotal: item.stokTotal,
            satuanSewa: item.satuanSewa,
          }}
          dpPct={dpPct}
          initialQty={qty}
        />
      </div>
    </div>
  );
}
