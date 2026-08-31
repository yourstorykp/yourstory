"use client";

import { useState } from "react";
import { PosCatalog } from "./pos-catalog";
import { PosCart } from "./pos-cart";
import { PosCheckoutForm } from "./pos-checkout-form";

export type AdminPosItem = {
  id: number;
  name: string;
  hargaSewa: number | string;
  stokTotal: number;
  satuanSewa: string;
  fotoUrl: string | null;
  categoryId: number | null;
};

export type AdminPosCustomer = {
  id: number;
  name: string;
  contact: string | null;
};

export type PosCartItem = AdminPosItem & { qty: number };

export function AdminPOS({
  items,
  customers,
  categories,
}: {
  items: AdminPosItem[];
  customers: AdminPosCustomer[];
  categories: { id: number; name: string }[];
}) {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [view, setView] = useState<"catalog" | "checkout">("catalog");

  const addItem = (item: AdminPosItem) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex) {
        if (ex.qty >= item.stokTotal) return prev;
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id !== id) return i;
          const nq = i.qty + delta;
          if (nq > i.stokTotal) return i;
          return { ...i, qty: nq };
        })
        .filter((i) => i.qty > 0)
    );
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-6 lg:flex-row">
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
        {view === "catalog" ? (
          <PosCatalog items={items} categories={categories} onAdd={addItem} />
        ) : (
          <PosCheckoutForm 
            cart={cart} 
            customers={customers} 
            onBack={() => setView("catalog")} 
            onSuccess={() => {
              setCart([]);
              setView("catalog");
            }}
          />
        )}
      </div>

      <div className="w-full shrink-0 lg:w-96">
        <PosCart
          cart={cart}
          onUpdateQty={updateQty}
          onCheckout={() => setView("checkout")}
          isCheckoutView={view === "checkout"}
        />
      </div>
    </div>
  );
}
