"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";

export function AddToCartButton({
  item,
}: {
  item: {
    id: number;
    name: string;
    hargaSewa: number | string;
    satuanSewa: string;
    stokTotal: number;
  };
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Jumlah unit</span>
        <input
          type="number"
          min={1}
          max={item.stokTotal}
          value={qty}
          onChange={(e) =>
            setQty(
              Math.max(1, Math.min(item.stokTotal, Number(e.target.value) || 1)),
            )
          }
          className="h-9 w-20 rounded-lg border border-input bg-card px-2 text-sm"
        />
      </div>
      <Button
        type="button"
        onClick={() =>
          add(
            {
              itemId: item.id,
              name: item.name,
              hargaSewa: item.hargaSewa,
              satuanSewa: item.satuanSewa,
              stokTotal: item.stokTotal,
            },
            qty,
          )
        }
        className="w-full bg-forest hover:bg-forest-deep"
      >
        Tambah ke Keranjang
      </Button>
    </div>
  );
}
