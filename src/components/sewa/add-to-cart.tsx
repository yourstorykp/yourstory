"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { createPortal } from "react-dom";

export function AddToCartButton({
  item,
}: {
  item: {
    id: number;
    name: string;
    hargaSewa: number | string;
    satuanSewa: string;
    stokTotal: number;
    fotoUrl?: string | null;
  };
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const max = Number(item.stokTotal) || 99;
  const btnRef = useRef<HTMLButtonElement>(null);

  const [animations, setAnimations] = useState<{ id: number, sx: number, sy: number, sw: number, sh: number, ex: number, ey: number }[]>([]);
  const animCounter = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleAdd = (e: React.MouseEvent) => {
    let sx = e.clientX;
    let sy = e.clientY;
    let sw = 100;
    let sh = 100;
    
    // Cari elemen foto secara fleksibel
    const imgEl = document.querySelector('img[alt="' + item.name + '"]');
    if (imgEl) {
      const rect = imgEl.getBoundingClientRect();
      sx = rect.left;
      sy = rect.top;
      sw = rect.width;
      sh = rect.height;
    }

    let ex = window.innerWidth - 60;
    let ey = window.innerHeight - 60;
    // Cari tombol keranjang secara dinamis
    const cartEl = document.getElementById("cart-widget-btn");
    if (cartEl) {
      const cartRect = cartEl.getBoundingClientRect();
      ex = cartRect.left;
      ey = cartRect.top;
    }

    const id = animCounter.current++;
    setAnimations(prev => [...prev, { id, sx, sy, sw, sh, ex, ey }]);

    setTimeout(() => {
      add(
        {
          itemId: item.id,
          name: item.name,
          hargaSewa: item.hargaSewa,
          satuanSewa: item.satuanSewa,
          stokTotal: item.stokTotal,
        },
        qty,
      );
    }, 1300);

    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== id));
    }, 1500);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Jumlah unit</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Kurang"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-lg font-medium hover:bg-muted"
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
            className="h-9 w-16 rounded-lg border border-input bg-card px-2 text-center text-sm"
          />
          <button
            type="button"
            aria-label="Tambah"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-lg font-medium hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>
      <Button
        ref={btnRef}
        type="button"
        onClick={handleAdd}
        className="w-full bg-forest hover:bg-forest-deep"
      >
        Tambah ke Keranjang
      </Button>

      {/* Render portals untuk animasi terbang */}
      {mounted && createPortal(
        <>
          {animations.map(anim => (
            <div
              key={anim.id}
              className="fixed z-[100] pointer-events-none animate-fly-cart overflow-hidden rounded-xl bg-card border-2 border-forest shadow-2xl"
              style={{
                '--start-x': `${anim.sx}px`,
                '--start-y': `${anim.sy}px`,
                '--start-w': `${anim.sw}px`,
                '--start-h': `${anim.sh}px`,
                '--end-x': `${anim.ex}px`,
                '--end-y': `${anim.ey}px`,
                transformOrigin: 'top left',
              } as React.CSSProperties}
            >
              {item.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.fotoUrl} alt="flying" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-forest/20 flex items-center justify-center text-forest-deep font-heading text-4xl">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </>,
        document.body
      )}
    </div>
  );
}
