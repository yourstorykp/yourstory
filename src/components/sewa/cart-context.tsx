"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

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
  add: (it: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (itemId: number) => void;
  setQty: (itemId: number, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ys_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
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

  const add: CartCtx["add"] = useCallback((it, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((p) => p.itemId === it.itemId);
      if (ex) {
        return prev.map((p) =>
          p.itemId === it.itemId
            ? { ...p, qty: Math.min(p.stokTotal, p.qty + qty) }
            : p,
        );
      }
      return [...prev, { ...it, qty: Math.min(it.stokTotal, qty) }];
    });
  }, []);

  const remove: CartCtx["remove"] = useCallback((itemId) => {
    setItems((prev) => prev.filter((p) => p.itemId !== itemId));
  }, []);

  const setQty: CartCtx["setQty"] = useCallback((itemId, qty) => {
    setItems((prev) =>
      prev.map((p) =>
        p.itemId === itemId
          ? { ...p, qty: Math.max(1, Math.min(p.stokTotal, qty)) }
          : p,
      ),
    );
  }, []);

  const clear: CartCtx["clear"] = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, add, remove, setQty, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart harus dipakai di dalam CartProvider");
  return c;
}
