"use client";

import { useState } from "react";
import { PosCatalog } from "./pos-catalog";
import { PosCart } from "./pos-cart";
import { PosCheckoutForm } from "./pos-checkout-form";
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";

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
  const [showCartPopup, setShowCartPopup] = useState(false);

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

  const totalItems = cart.reduce((acc, it) => acc + it.qty, 0);
  const totalPrice = cart.reduce((acc, it) => acc + (Number(it.hargaSewa) || 0) * it.qty, 0);

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4">
      {view === "catalog" && (
        <div className="flex shrink-0 items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm flex-wrap gap-4">
          <div className="font-heading text-lg font-semibold">
            Subtotal: <span className="text-forest">{formatRupiah(totalPrice)}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowCartPopup(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Keranjang ({totalItems})
            </Button>
            <Button 
              className="flex-1 sm:flex-none bg-forest hover:bg-forest-deep text-white" 
              onClick={() => setView("checkout")} 
              disabled={cart.length === 0}
            >
              Lanjut Booking
            </Button>
          </div>
        </div>
      )}

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

      {showCartPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowCartPopup(false)}
        >
          <div 
            className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-heading text-lg font-semibold">Isi Keranjang ({totalItems})</h2>
              <button 
                onClick={() => setShowCartPopup(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <PosCart
                cart={cart}
                onUpdateQty={updateQty}
                onCheckout={() => {}} 
                isCheckoutView={false}
              />
            </div>
            
            <div className="border-t border-border p-4 bg-muted/30">
              <Button
                className="w-full bg-forest hover:bg-forest-deep"
                disabled={cart.length === 0}
                onClick={() => {
                  setShowCartPopup(false);
                  setView("checkout");
                }}
              >
                Lanjut Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
