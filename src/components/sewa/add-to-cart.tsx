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

  const [animations, setAnimations] = useState<{ id: number, x: number, y: number }[]>([]);
  const animCounter = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleAdd = (e: React.MouseEvent) => {
    // 1. Dapatkan posisi awal
    let startX = e.clientX;
    let startY = e.clientY;
    
    // Jika bisa dapat posisi foto utama, pakai itu. 
    // Tapi karena komponen foto ada di bagian luar, kita asumsikan posisi klik sebagai awalnya
    // atau posisi tengah layar.
    const imgEl = document.querySelector('img[alt="' + item.name + '"]');
    if (imgEl) {
      const rect = imgEl.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    // 2. Tambahkan animasi
    const id = animCounter.current++;
    setAnimations(prev => [...prev, { id, x: startX, y: startY }]);

    // 3. Tambahkan ke keranjang setelah delay agar pas dengan animasi sampai
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
    }, 1300); // 1.3 detik dari 1.5 detik total animasi (biar pas landing langsung nambah)

    // 4. Hapus animasi setelah selesai
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
                '--start-x': `${anim.x}px`,
                '--start-y': `${anim.y}px`,
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
