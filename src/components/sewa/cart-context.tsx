"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import { createPortal } from "react-dom";

export type CartItem = {
  itemId: number;
  name: string;
  hargaSewa: number | string;
  satuanSewa: string;
  stokTotal: number;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  add: (it: Omit<CartItem, "qty">, qty?: number, e?: React.MouseEvent | null, fotoUrl?: string | null) => void;
  remove: (itemId: number) => void;
  setQty: (itemId: number, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ys_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Animation state
  const [animations, setAnimations] = useState<{ id: number, sx: number, sy: number, sw: number, sh: number, ex: number, ey: number, fotoUrl: string | null, name: string }[]>([]);
  const animCounter = useRef(0);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  useEffect(() => {
    const clearOnExit = () => {
      try {
        localStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pagehide", clearOnExit);
    return () => window.removeEventListener("pagehide", clearOnExit);
  }, []);

  const internalAdd = useCallback((it: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((x) => x.itemId === it.itemId);
      if (ex) {
        return prev.map((x) =>
          x.itemId === it.itemId
            ? { ...x, qty: Math.min(Number(it.stokTotal), x.qty + qty) }
            : x,
        );
      }
      return [...prev, { ...it, qty }];
    });
  }, []);

  const add = useCallback(
    (it: Omit<CartItem, "qty">, qty = 1, e?: React.MouseEvent | null, fotoUrl?: string | null) => {
      if (!e) {
        internalAdd(it, qty);
        return;
      }

      // Animasi terbang
      let sx = e.clientX;
      let sy = e.clientY;
      let sw = 100;
      let sh = 100;
      
      const imgEl = document.querySelector('img[alt="' + it.name + '"]');
      if (imgEl) {
        const rect = imgEl.getBoundingClientRect();
        sx = rect.left + rect.width / 2;
        sy = rect.top + rect.height / 2;
        sw = rect.width;
        sh = rect.height;
      }

      let ex = window.innerWidth - 30;
      let ey = window.innerHeight - 30;
      const cartEl = document.getElementById("cart-widget-btn");
      if (cartEl) {
        const cartRect = cartEl.getBoundingClientRect();
        ex = cartRect.left + cartRect.width / 2;
        ey = cartRect.top + cartRect.height / 2;
      }

      const id = animCounter.current++;
      setAnimations(prev => [...prev, { id, sx, sy, sw, sh, ex, ey, fotoUrl: fotoUrl ?? null, name: it.name }]);

      setTimeout(() => {
        internalAdd(it, qty);
      }, 1300);

      setTimeout(() => {
        setAnimations(prev => prev.filter(a => a.id !== id));
      }, 1500);
    },
    [internalAdd]
  );

  const remove = useCallback((itemId: number) => {
    setItems((prev) => prev.filter((x) => x.itemId !== itemId));
  }, []);

  const setQty = useCallback((itemId: number, qty: number) => {
    setItems((prev) =>
      prev.map((x) => (x.itemId === itemId ? { ...x, qty } : x)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((a, b) => a + b.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, add, remove, setQty, clear }}>
      {children}
      {mounted && createPortal(
        <>
          {animations.map(anim => {
            const targetScale = 48 / Math.max(anim.sw, anim.sh);
            return (
              <div
                key={anim.id}
                className="fixed z-[100] pointer-events-none animate-fly-cart overflow-hidden rounded-xl bg-card shadow-2xl"
                style={{
                  '--start-x': `${anim.sx}px`,
                  '--start-y': `${anim.sy}px`,
                  '--start-w': `${anim.sw}px`,
                  '--start-h': `${anim.sh}px`,
                  '--end-x': `${anim.ex}px`,
                  '--end-y': `${anim.ey}px`,
                  '--target-scale': targetScale,
                } as React.CSSProperties}
              >
                {anim.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={anim.fotoUrl} alt="flying" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-forest/20 flex items-center justify-center text-forest-deep font-heading text-4xl">
                    {anim.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
        </>,
        document.body
      )}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
